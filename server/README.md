# Cattle Breed Recognition - Backend Server

Node.js Express server for the Cattle Breed Recognition system. Serves the web client and handles ML model integration.

## Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Auth**: Clerk middleware
- **Storage**: Cloudinary for image uploads
- **ML Service**: FastAPI model server

## Features

- RESTful API for predictions, breeds, users
- Image upload with Multer + Cloudinary
- Clerk webhook integration
- User prediction history
- Breed database with enrichments
- Location-based breed data

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/predict` | Upload image for prediction |
| GET | `/api/predictions/:id` | Get prediction by ID |
| GET | `/api/predictions/history/:clerkId` | User's prediction history |
| GET | `/api/breeds` | All breeds (paginated) |
| GET | `/api/breeds/:name` | Breed by name |
| GET | `/api/breeds/species/:species` | Breeds by species |
| GET | `/api/users/profile/:clerkId` | User profile |
| POST | `/api/users/sync` | Sync user from Clerk |
| GET | `/api/users/statistics/:clerkId` | User stats |
| POST | `/api/webhooks/clerk` | Clerk webhook |
| GET | `/health` | Health check |

## Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Environment Variables

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
MODEL_API_URL=http://127.0.0.1:8000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Production start
- `npm run seed` - Seed breed database

## Project Structure

```
server/
├── src/
│   ├── config/         # DB, Cloudinary config
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, webhooks
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   └── utils/         # Helpers, seeding
├── server.js           # Entry point
└── package.json
```