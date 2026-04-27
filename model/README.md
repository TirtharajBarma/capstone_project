# Cattle Breed Recognition - ML Model Service

FastAPI-powered machine learning inference service for cattle and buffalo breed classification.

## What It Does

This service hosts a pre-trained PyTorch model that identifies **41 cattle and buffalo breeds** from images. It:

- Accepts image uploads via REST API
- Runs EfficientNet-based neural network inference
- Returns breed prediction with confidence score
- Provides species classification (cattle/buffalo)

## Stack

- **Framework**: FastAPI
- **ML**: PyTorch, torchvision
- **Model**: EfficientNet-B0 (transfer learning)
- **Image Processing**: PIL, numpy

## Supported Breeds

### Cattle (36 breeds)
Alambadi, Amritmahal, Ayrshire, Banni, Bargur, Bhadawari, Brown Swiss, Dangi, Deoni, Gir, Guernsey, Hallikar, Hariana, Holstein Friesian, Jersey, Kangayam, Kankrej, Kasargod, Kenkatha, Kherigarh, Khillari, Krishna Valley, Malnad Gidda, Nagori, Nagpuri, Nimari, Ongole, Pulikulam, Rathi, Red Dane, Red Sindhi, Sahiwal, Tharparkar, Toda, Umblachery, Vechur

### Buffalo (5 breeds)
Jaffrabadi, Mehsana, Murrah, Nili Ravi, Surti

## Prerequisites

```bash
# Python 3.9+
python --version

# Recommended: Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

## Installation

```bash
cd model

# Install dependencies
pip install -r requirements.txt

# Or install individual packages
pip install fastapi uvicorn python-multipart torch torchvision pillow numpy
```

## Setup

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Service

### Development

```bash
# Start the FastAPI server
python app.py
```

The service will start on `http://localhost:8000`

### Production

```bash
# Using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/predict` | Upload image for prediction |

### Prediction Request

```bash
curl -X POST -F "file=@image.jpg" http://localhost:8000/predict
```

### Response Format

```json
{
  "breed": "Gir",
  "species": "cattle",
  "confidence": 0.95,
  "inference_time_ms": 150.5
}
```

## Testing

```bash
# Test with a sample image
curl -X POST -F "file=@test_cow.jpg" http://localhost:8000/predict
```

## Environment Variables

No environment variables required - the model loads from local files.

## Project Structure

```
model/
├── app.py                  # FastAPI entry point
├── service.py              # Model inference service
├── requirements.txt        # Python dependencies
└── cow_breed_model/       # Trained model files
    ├── data.pkl           # Model artifacts
    └── data/              # Class labels
```

## Model Details

- **Architecture**: EfficientNet-B0 with custom classifier
- **Input Size**: 224x224 RGB images
- **Preprocessing**: ImageNet normalization
- **Training Data**: Custom dataset of 41 Indian cattle/buffalo breeds
- **Accuracy**: ~98% on validation set

## Troubleshooting

### Model Not Loading

```bash
# Check if model files exist
ls -la cow_breed_model/
```

### CUDA/GPU Support

The model runs on CPU by default. For GPU acceleration:

```python
# In service.py, change:
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
```

## Performance Tips

- The model loads once at startup (first request may be slower)
- GPU inference is ~10x faster than CPU
- Batch processing not supported (single image per request)

## License

MIT