# Cattle Breed Recognition System

AI-powered cattle and buffalo breed recognition system. Identifies 41 breeds across web and mobile platforms.

## Architecture

```
React Web (Vite 5173)          Expo Mobile App
        ↓                              ↓
        └────────────┬─────────────────┘
                    ↓
        Node.js Backend (5002)
                    ↓
        FastAPI ML Service (8000)
                    ↓
        PyTorch Model (EfficientNet)
```

## Modules

| Module | Description |
|--------|-------------|
| `/client` | React 19 frontend with Tailwind 4 |
| `/expo` | Expo SDK 54 mobile app |
| `/server` | Express.js 5 backend with MongoDB |
| `/model` | FastAPI ML inference service |

## Features

- 41 breed recognition (36 cattle + 5 buffalo)
- Multi-platform (web + iOS + Android)
- Clerk authentication
- Prediction history & analytics
- Breed database with information
- PDF export
- Cloud image storage

## Quick Start

```bash
# 1. ML Service
cd model && python app.py

# 2. Backend
cd server && npm install && npm run dev

# 3. Frontend
cd client && npm install && npm run dev

# 4. Mobile (optional)
cd expo && npm install && npm start
```

## Environment Setup

**Backend** (`server/.env`)
```
PORT=5002
MONGODB_URI=mongodb+srv://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
MODEL_API_URL=http://127.0.0.1:8000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend** (`client/.env`)
```
VITE_API_URL=http://localhost:5002/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Mobile** (`expo/.env`)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://192.168.1.x:5002/api
```

## Supported Breeds

### Cattle (36)
Alambadi, Amritmahal, Ayrshire, Banni, Bargur, Bhadawari, Brown Swiss, Dangi, Deoni, Gir, Guernsey, Hallikar, Hariana, Holstein Friesian, Jersey, Kangayam, Kankrej, Kasargod, Kenkatha, Kherigarh, Khillari, Krishna Valley, Malnad Gidda, Nagori, Nagpuri, Nimari, Ongole, Pulikulam, Rathi, Red Dane, Red Sindhi, Sahiwal, Tharparkar, Toda, Umblachery, Vechur

### Buffalo (5)
Jaffrabadi, Mehsana, Murrah, Nili Ravi, Surti

## API Endpoints

**Backend (5002)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/predict` | Upload image for prediction |
| GET | `/api/predictions/:id` | Get prediction |
| GET | `/api/predictions/history/:clerkId` | User history |
| GET | `/api/breeds` | All breeds |
| GET | `/api/breeds/:name` | Breed by name |
| GET | `/api/breeds/species/:species` | Filter by species |
| GET | `/api/users/profile/:clerkId` | User profile |
| POST | `/api/users/sync` | Sync user |
| GET | `/api/users/statistics/:clerkId` | User stats |
| POST | `/api/webhooks/clerk` | Clerk webhook |
| GET | `/health` | Health check |

**ML Service (8000)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/predict` | Image prediction |

## Project Structure

```
capstone/
├── client/          # React web frontend
├── expo/            # Expo mobile app
├── server/          # Express.js backend
└── model/           # FastAPI ML service
```

## Tech Stack

| Component | Technology |
|-----------|-------------|
| Frontend | React 19, Vite, Tailwind 4, Recharts |
| Mobile | Expo SDK 54, React Native, Expo Router |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | Clerk |
| Storage | Cloudinary |
| ML | FastAPI, PyTorch, EfficientNet |

## License

MIT