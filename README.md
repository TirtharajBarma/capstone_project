# Cattle Breed Recognition System

AI-powered cattle and buffalo breed recognition system using deep learning. Identifies 41 different breeds with high accuracy.

## 🏗️ Architecture

```
React Frontend (Port 5173)
    ↓
Node.js Backend (Port 5002)
    ↓
FastAPI ML Service (Port 8000)
    ↓
PyTorch Model (ResNet50)
```

## 🎯 Features

- **41 Breed Recognition**: Identifies cattle and buffalo breeds
- **High Accuracy**: Deep learning model with confidence scores
- **Real-time Predictions**: Fast inference (< 1 second)
- **User Authentication**: Secure login with Clerk
- **Prediction History**: Track all predictions
- **Breed Information**: Detailed breed characteristics
- **Responsive UI**: Works on desktop and mobile
- **RESTful API**: Well-documented endpoints

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- TailwindCSS
- Axios
- Clerk Authentication

### Backend
- Node.js + Express 5
- MongoDB Atlas
- Multer for file uploads
- Mongoose ODM

### ML Service
- FastAPI
- PyTorch
- Torchvision
- ResNet50 architecture

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/TirtharajBarma/capstone_project.git
cd capstone_project
```

### 2. Setup ML Service
```bash
cd model
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### 3. Setup Node.js Backend
```bash
cd server
npm install
npm run dev
```

### 4. Setup React Frontend
```bash
cd client
npm install
npm run dev
```

## 🧪 Testing

### Test ML Service
```bash
# Health check
curl http://localhost:8000/health

# Prediction
curl -X POST "http://localhost:8000/predict" \
  -F "image=@cattle.jpg"
```

### Interactive API Docs
Open http://localhost:8000/docs in your browser

## 📊 Supported Breeds

### Cattle (36 breeds)
Alambadi, Amritmahal, Ayrshire, Banni, Bargur, Bhadawari, Brown Swiss, Dangi, Deoni, Gir, Guernsey, Hallikar, Hariana, Holstein Friesian, Jersey, Kangayam, Kankrej, Kasargod, Kenkatha, Kherigarh, Khillari, Krishna Valley, Malnad Gidda, Nagori, Nagpuri, Nimari, Ongole, Pulikulam, Rathi, Red Dane, Red Sindhi, Sahiwal, Tharparkar, Toda, Umblachery, Vechur

### Buffalo (5 breeds)
Jaffrabadi, Mehsana, Murrah, Nili Ravi, Surti

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5002
MODEL_API_URL=http://127.0.0.1:8000/predict
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5002
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## 📈 API Endpoints

### ML Service (Port 8000)
- `GET /health` - Health check
- `POST /predict` - Image prediction

### Backend (Port 5002)
- `POST /api/predict` - Upload image
- `GET /api/predict/:id` - Get prediction
- `GET /api/breeds` - Get all breeds
- `GET /api/history` - Prediction history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Review the logs in each service
2. Open an issue on GitHub

---

**Made with ❤️ for cattle farmers and veterinarians**
