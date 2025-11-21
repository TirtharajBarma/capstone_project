# ML Model Service

FastAPI service for cattle and buffalo breed recognition using PyTorch and ResNet50.

## Features

- **41 Breed Recognition**: Identifies cattle and buffalo breeds
- **High Accuracy**: Deep learning model with confidence scores
- **Fast Inference**: Optimized PyTorch model (< 1 second)
- **RESTful API**: FastAPI with automatic documentation
- **Health Monitoring**: Health check endpoints

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

- `best_model.pth` - Trained PyTorch model weights
- `final_model.pth` - Fallback model file
- `classes.json` - Class names mapping
- `service.py` - Model inference service
- `app.py` - FastAPI application

## Configuration

### Environment Variables

Create a `.env` file (optional):
```env
MODEL_PATH=best_model.pth
CLASSES_PATH=classes.json
MODEL_DEVICE=cpu
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5002
```

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- Maximum file size: 10MB

## Performance

- **Inference Time**: < 1 second on CPU
- **Memory Usage**: ~500MB
- **Concurrent Requests**: Supported via uvicorn workers

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