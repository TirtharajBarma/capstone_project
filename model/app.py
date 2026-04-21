import os
import time
import io
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from service import ModelService

app = FastAPI(title="Cow Breed Classifier API")
model_service = None


@app.on_event("startup")
async def startup_event():
    global model_service
    print("Loading model service...")
    model_service = ModelService()
    print("Model service loaded!")


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model_service is not None,
        "timestamp": time.time(),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model_service is None:
        return JSONResponse({"error": "Model not loaded"}, status_code=500)

    start_time = time.time()

    image_bytes = await file.read()
    result = model_service.predict_bytes(image_bytes)

    result["inference_time_ms"] = round((time.time() - start_time) * 1000, 2)

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
