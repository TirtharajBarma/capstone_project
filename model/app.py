import os
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from PIL import Image
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

try:
    from service import ModelService
except ModuleNotFoundError:  # when running as a package (pytorch.app)
    from .service import ModelService


app = FastAPI(title="Cattle Breed Model API", version="1.0.0")

# Load .env if available (no-op if package missing)
if load_dotenv is not None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    # Allow values later in the file to override earlier ones and OS envs
    load_dotenv(dotenv_path=env_path, override=True)

# CORS (allow localhost by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        os.getenv("BACKEND_URL", "http://localhost:5002"),
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5002",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global model service instance
model_service: ModelService | None = None


@app.on_event("startup")
def startup_event():
    global model_service
    model_path = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "best_cattle_model_pro.pth"))
    if not os.path.exists(model_path):
        # fallback to older models
        for fallback in ["best_model.pth", "final_model.pth"]:
            alt_path = os.path.join(os.path.dirname(__file__), fallback)
            if os.path.exists(alt_path):
                model_path = alt_path
                break

    classes_path = os.getenv("CLASSES_PATH", os.path.join(os.path.dirname(__file__), "classes.json"))
    device = os.getenv("MODEL_DEVICE", None)

    try:
        model_service = ModelService(model_path=model_path, classes_path=classes_path, device=device)
    except Exception as e:
        # Fail fast with clear message; health endpoint will reflect this too
        raise RuntimeError(f"Model initialization failed: {e}")


@app.get("/health")
def health():
    global model_service
    ok = model_service is not None
    details = {
        "success": ok,
        "message": "Model loaded" if ok else "Model not initialized",
        "model_path": getattr(model_service, "model_path", None) if ok else None,
        "classes_count": len(getattr(model_service, "classes", [])) if ok else 0,
        "device": str(getattr(model_service, "device", "cpu")) if ok else None,
    }
    status = 200 if ok else 503
    return JSONResponse(content=details, status_code=status)


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    global model_service
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model service not ready")

    if image.content_type not in {"image/jpeg", "image/png", "image/jpg"}:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are supported.")

    try:
        content = await image.read()
        pil = Image.open(BytesIO(content))
        breed, confidence, top_predictions, elapsed_ms = model_service.predict(pil)

        # Explicitly close the PIL image
        pil.close()

        # Determine species based on the predicted breed
        if breed == "unknown":
            species = "unknown"
        else:
            species = model_service._classify_species(breed)

        return {
            "breed": breed,
            "confidence": float(confidence),
            "inference_time_ms": float(elapsed_ms),
            "species": species,
            "top_predictions": top_predictions,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host=host, port=port, reload=False, workers=1)
