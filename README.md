# Cattle Breed Recognition System

AI-powered cattle and buffalo breed recognition system using deep learning. Identifies 41 different breeds across web and mobile platforms.

## 🏗️ Architecture

```
React Web App (Port 5173)          Expo Mobile App
         ↓                                ↓
         └────────────────┬───────────────┘
                          ↓
              Node.js Backend (Port 5002)
                          ↓
              FastAPI ML Service (Port 8000)
                          ↓
          PyTorch Model (EfficientNet V2-S)
```

## 🎯 Features

- **41 Breed Recognition**: Identifies cattle and buffalo breeds
- **Multi-Platform**: Web app (React) + Mobile app (Expo/React Native)
- **High Accuracy**: EfficientNet V2-S model with confidence scores
- **Real-time Predictions**: Fast inference (< 1 second)
- **User Authentication**: Secure login with Clerk (web + mobile)
- **Prediction History**: Track all predictions with MongoDB
- **Breed Information**: Detailed breed characteristics and species classification
- **Responsive Design**: Works on desktop, mobile web, iOS, and Android
- **RESTful API**: Well-documented endpoints with FastAPI docs

## 🛠️ Tech Stack

### Web Frontend (`/client`)
- React 19 + Vite
- TailwindCSS + Lucide Icons
- Axios
- Clerk Authentication
- React Router

### Mobile App (`/expo`)
- React Native + Expo
- Expo Router (file-based routing)
- Clerk Expo SDK
- Axios with secure token storage
- Cross-platform (iOS + Android)

### Backend (`/server`)
- Node.js + Express 5
- MongoDB Atlas + Mongoose ODM
- Multer for file uploads
- Clerk authentication middleware
- RESTful API design

### ML Service (`/model`)
- FastAPI + Uvicorn
- PyTorch + Torchvision
- EfficientNet V2-S architecture
- PIL for image processing
- Confidence thresholding & species classification

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account
- Clerk account (for authentication)
- Expo CLI (for mobile app): `npm install -g expo-cli`

### 1. Clone the repository
```bash
git clone https://github.com/TirtharajBarma/capstone_project.git
cd capstone_project
```

### 2. Setup ML Service
```bash
cd model
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (optional)
echo "MODEL_PATH=best_cattle_model_pro.pth" > .env
echo "PORT=8000" >> .env

# Start service
python3 app.py
```
Service runs on `http://localhost:8000`

### 3. Setup Node.js Backend
```bash
cd server
npm install

# Configure .env file
cp .env.example .env
# Edit .env with your MongoDB URI and Clerk keys

# Seed database with breed data
npm run seed

# Start server
npm run dev
```
Server runs on `http://localhost:5002`

### 4. Setup React Web Frontend
```bash
cd client
npm install

# Configure .env file
cp .envSample .env
# Edit .env with your Clerk publishable key

# Start development server
npm run dev
```
Web app runs on `http://localhost:5173`

### 5. Setup Expo Mobile App (Optional)
```bash
cd expo
npm install

# Configure .env file
cp .env.example .env
# Edit .env with Clerk key and your local IP address

# Start Expo
npm start

# Run on iOS: npm run ios
# Run on Android: npm run android
# Or scan QR code with Expo Go app
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

**ML Service (`/model/.env`)**
```env
MODEL_PATH=best_cattle_model_pro.pth
CLASSES_PATH=classes.json
MODEL_DEVICE=cpu
HOST=0.0.0.0
PORT=8000
MODEL_INPUT_SIZE=224
MODEL_REJECT_THRESHOLD=0.45
MODEL_MARGIN_THRESHOLD=0.05
```

**Backend Server (`/server/.env`)**
```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cattle-breed
MODEL_API_URL=http://127.0.0.1:8000/predict
MODEL_API_TIMEOUT=30000
FRONTEND_URL=http://localhost:5173
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

**Web Client (`/client/.env`)**
```env
VITE_API_URL=http://localhost:5002/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

**Mobile App (`/expo/.env`)**
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5002/api
```
*Note: Replace `192.168.1.XXX` with your machine's local IP address*

## 📈 API Endpoints

### ML Service (Port 8000)
- `GET /health` - Health check with model info
- `POST /predict` - Image prediction with confidence scores
- `GET /docs` - Interactive Swagger API documentation

### Backend (Port 5002)
**Predictions**
- `POST /api/predictions/predict` - Upload image for prediction
- `GET /api/predictions/:id` - Get specific prediction
- `GET /api/predictions/history/:clerkId` - User prediction history

**Breeds**
- `GET /api/breeds` - Get all breeds (paginated)
- `GET /api/breeds/:name` - Get breed by name
- `GET /api/breeds/species/:species` - Filter by species (cow/buffalo)
- `GET /api/breeds/search?q=query` - Search breeds

**Users**
- `GET /api/users/profile/:clerkId` - Get user profile
- `POST /api/users/sync` - Sync user with backend
- `GET /api/users/statistics/:clerkId` - User statistics

**Health**
- `GET /health` - API health status

## 📱 Platform Support

| Platform | Status | Technology |
|----------|--------|------------|
| Web Desktop | ✅ Ready | React + Vite |
| Web Mobile | ✅ Ready | Responsive design |
| iOS | ✅ Ready | Expo + React Native |
| Android | ✅ Ready | Expo + React Native |

## 🧪 Testing

### Test ML Service
```bash
# Health check
curl http://localhost:8000/health

# Prediction
curl -X POST "http://localhost:8000/predict" -F "image=@cattle.jpg"

# Interactive docs
open http://localhost:8000/docs
```

### Test Backend
```bash
# Health check
curl http://localhost:5002/health

# Get all breeds
curl http://localhost:5002/api/breeds

# Search breeds
curl "http://localhost:5002/api/breeds/search?q=gir"
```

## 📂 Project Structure

```
capstone_project/
├── client/          # React web frontend
├── expo/            # React Native mobile app
├── server/          # Node.js Express backend
├── model/           # FastAPI ML service
└── README.md        # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Check the README in each service directory
2. Review the logs in each service
3. Open an issue on GitHub

## 📄 License

This project is part of a capstone project for cattle breed recognition.

---

**Made with ❤️ for cattle farmers and veterinarians**
