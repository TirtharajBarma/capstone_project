# ML Model Service

FastAPI service for cattle and buffalo breed recognition using PyTorch and EfficientNet V2-S.

## Features

- **41 Breed Recognition**: Identifies 36 cattle breeds + 5 buffalo breeds
- **EfficientNet V2-S Architecture**: State-of-the-art deep learning model
- **Confidence Thresholding**: Rejects low-confidence predictions (< 45%)
- **Species Classification**: Automatically categorizes as cow/buffalo/unknown
- **Fast Inference**: Optimized PyTorch model (< 1 second on CPU)
- **Test Time Augmentation (TTA)**: Optional image augmentation for better accuracy
- **Temperature Scaling**: Calibrated confidence scores
- **RESTful API**: FastAPI with automatic Swagger documentation
- **Health Monitoring**: Detailed health check with model info

## Supported Breeds

### Cattle (36 breeds)
Alambadi, Amritmahal, Ayrshire, Banni, Bargur, Bhadawari, Brown Swiss, Dangi, Deoni, Gir, Guernsey, Hallikar, Hariana, Holstein Friesian, Jersey, Kangayam, Kankrej, Kasargod, Kenkatha, Kherigarh, Khillari, Krishna Valley, Malnad Gidda, Nagori, Nagpuri, Nimari, Ongole, Pulikulam, Rathi, Red Dane, Red Sindhi, Sahiwal, Tharparkar, Toda, Umblachery, Vechur

### Buffalo (5 breeds)
Jaffrabadi, Mehsana, Murrah, Nili Ravi, Surti

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager

### Steps

1. **Navigate to model directory**
   ```bash
   cd model
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv .venv
   ```

3. **Activate virtual environment**
   ```bash
   # On macOS/Linux
   source .venv/bin/activate
   
   # On Windows
   .venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the service**
   ```bash
   python3 app.py
   ```

The service will start on `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

**Response:**
```json
{
  "success": true,
  "message": "Model loaded",
  "model_path": "/path/to/model.pth",
  "classes_count": 41,
  "device": "cpu"
}
```

### Prediction
- **POST** `/predict` - Upload image for breed prediction

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` file (JPEG/PNG, max 10MB)

**Response:**
```json
{
  "breed": "Gir",
  "confidence": 0.963,
  "inference_time_ms": 120.5,
  "species": "cattle",
  "top_predictions": [
    {"breed": "Gir", "confidence": 0.963},
    {"breed": "Sahiwal", "confidence": 0.025},
    {"breed": "Red Sindhi", "confidence": 0.012}
  ]
}
```

## Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Image Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -F "image=@cattle_image.jpg"
```

### Interactive API Documentation
Open your browser and navigate to:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Model Files

- `best_cattle_model_pro.pth` - Primary trained model (EfficientNet V2-S)
- `best_model.pth` - Fallback model file
- `final_model.pth` - Secondary fallback
- `classes.json` - 41 breed class names mapping
- `cattle_categories.json` - Cow/buffalo species classification
- `service.py` - Model inference service with TTA and thresholding
- `app.py` - FastAPI application with CORS and health checks
- `requirements.txt` - Python dependencies

## Configuration

### Environment Variables

Create a `.env` file (optional):
```env
# Model Configuration
MODEL_PATH=best_cattle_model_pro.pth
CLASSES_PATH=classes.json
MODEL_DEVICE=cpu                    # or 'cuda' for GPU

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Model Inference Settings
MODEL_INPUT_SIZE=224                # Image input size (224 or 384)
MODEL_TEMPERATURE=1.0               # Temperature scaling (1.0 = no scaling)
MODEL_REJECT_THRESHOLD=0.45         # Minimum confidence to accept prediction
MODEL_MARGIN_THRESHOLD=0.05         # Minimum gap between top 2 predictions
MODEL_TTA=1                         # Test Time Augmentation (1 = off, 2 = on)

# CORS Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5002
```

### Configuration Explained

**MODEL_REJECT_THRESHOLD** (default: 0.45)
- Predictions below this confidence return "unknown"
- Higher = more conservative (fewer false positives)
- Lower = more permissive (more predictions accepted)

**MODEL_MARGIN_THRESHOLD** (default: 0.05)
- Minimum confidence gap between 1st and 2nd predictions
- Catches cases where model is confused between similar breeds
- Example: If top is 46% and second is 44%, margin is only 2% → returns "unknown"

**MODEL_TTA** (default: 1)
- 1 = No augmentation (faster)
- 2 = Mirror augmentation (slightly better accuracy, 2x slower)

**MODEL_TEMPERATURE** (default: 1.0)
- Adjusts confidence calibration
- > 1.0 = softer probabilities (less confident)
- < 1.0 = sharper probabilities (more confident)
- 1.0 = no adjustment

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- Maximum file size: 10MB

## Performance

- **Inference Time**: 
  - CPU: ~200-500ms per image
  - GPU: ~50-100ms per image
  - With TTA: 2x slower
- **Memory Usage**: 
  - CPU: ~500MB
  - GPU: ~1.5GB VRAM
- **Model Size**: ~20MB (.pth file)
- **Input Size**: 224x224 RGB images
- **Concurrent Requests**: Supported via uvicorn workers

## Model Architecture

The service uses **EfficientNet V2-S** with the following structure:
- Backbone: EfficientNet V2-S (pretrained, then fine-tuned)
- Classifier: Dropout(0.2) → Linear(feature_dim → 41 classes)
- Input: 224x224 RGB images
- Preprocessing: Resize → CenterCrop → Normalize (ImageNet stats)
- Output: 41-class softmax probabilities

### Why EfficientNet V2-S?
- Better accuracy than ResNet50 with similar speed
- Optimized for both accuracy and inference speed
- Smaller model size (~20MB vs ~100MB for ResNet50)

## Troubleshooting

### Common Issues

1. **Model file not found**
   ```
   RuntimeError: Model initialization failed
   ```
   - Ensure `best_model.pth` or `final_model.pth` exists in the model directory

2. **GPU not detected**
   - The service defaults to CPU inference
   - For GPU support, ensure CUDA is installed and set `MODEL_DEVICE=cuda`

3. **Memory issues**
   - Reduce batch size or use CPU inference
   - Close other applications to free up memory

### Logs

The service provides detailed logging for debugging:
- Request/response times
- Model loading status
- Error details

## Development

### Running in Development Mode
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Testing with Different Models
1. Place your model file in the model directory
2. Update `MODEL_PATH` environment variable
3. Restart the service

## License

This model service is part of the Cattle Breed Recognition capstone project.