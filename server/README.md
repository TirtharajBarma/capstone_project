# Backend Server

Node.js Express server for the Cattle Breed Recognition system. Serves both web and mobile clients.

## Features

- **Image Upload & Processing**: Accept and validate image uploads with Multer
- **ML Model Integration**: Forward images to FastAPI ML service for breed prediction
- **User Authentication**: Clerk-based authentication for web and mobile
- **Database Management**: MongoDB with Mongoose for predictions, breeds, and users
- **Prediction History**: Track user predictions with statistics
- **RESTful API**: Comprehensive API endpoints for web and mobile clients
- **Error Handling**: Robust error handling and validation
- **CORS Support**: Configured for web frontend and mobile app

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Clerk (supports web + mobile)
- **File Upload**: Multer (multipart/form-data)
- **HTTP Client**: Axios (for ML service communication)
- **Environment**: dotenv
- **Validation**: Express validator middleware

## API Endpoints

### Prediction Endpoints
- `POST /api/predictions/predict` - Upload image for breed prediction
- `GET /api/predictions/:id` - Get specific prediction by ID
- `GET /api/predictions/history/:clerkId` - Get user's prediction history
- `DELETE /api/predictions/:id` - Delete prediction

### Breed Information Endpoints
- `GET /api/breeds` - Get all breeds with pagination
- `GET /api/breeds/:name` - Get breed by name
- `GET /api/breeds/species/:species` - Get breeds by species (cow/buffalo)
- `GET /api/breeds/search?q=query` - Search breeds by name

### User Endpoints
- `GET /api/users/profile/:clerkId` - Get user profile
- `POST /api/users/sync` - Sync user data from Clerk
- `GET /api/users/statistics/:clerkId` - Get user statistics (scans, breeds identified, etc.)
- `PUT /api/users/profile/:clerkId` - Update user profile

### Health Check
- `GET /health` - API health status
- `GET /api/predictions/health` - Check ML model service connectivity

## Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with the following variables:
   ```env
   # Server Configuration
   PORT=5002
   NODE_ENV=development

   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cattle-breed-recognition

   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here

   # ML Model API Configuration
   MODEL_API_URL=http://127.0.0.1:8000/predict
   MODEL_API_TIMEOUT=30000

   # Upload Configuration
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   MOBILE_APP_URL=exp://localhost:8081
   ```

4. **Database Setup**
   Seed the database with initial breed data:
   ```bash
   npm run seed
   ```

5. **Start the server**
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── predictionController.js  # Prediction logic
│   │   ├── breedController.js       # Breed information
│   │   └── historyController.js     # Prediction history
│   ├── middleware/
│   │   ├── upload.js            # Multer file upload
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── Breed.js             # Breed schema
│   │   ├── Prediction.js        # Prediction schema
│   │   ├── User.js              # User schema
│   │   └── index.js             # Model exports
│   ├── routes/
│   │   ├── predictionRoutes.js  # Prediction routes
│   │   ├── breedRoutes.js       # Breed routes
│   │   ├── historyRoutes.js     # History routes
│   │   └── index.js             # Route exports
│   └── utils/
│       ├── helpers.js           # Utility functions
│       └── seedData.js          # Database seeding
├── .env                         # Environment variables
├── server.js                    # Main server file
└── package.json                 # Dependencies and scripts
```

## Usage Examples

### Upload Image for Prediction
```bash
curl -X POST http://localhost:5002/api/predict \
  -F "image=@/path/to/cattle-image.jpg"
```

### Get All Breeds
```bash
curl http://localhost:5002/api/breeds
```

### Search Breeds
```bash
curl "http://localhost:5002/api/breeds/search?q=gir"
```

### Get Prediction History
```bash
curl "http://localhost:5002/api/history?page=1&limit=10"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5002 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Required |
| `CLERK_SECRET_KEY` | Clerk secret key | Required |
| `MODEL_API_URL` | ML model API endpoint | http://127.0.0.1:8000/predict |
| `MODEL_API_TIMEOUT` | Request timeout (ms) | 30000 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 10485760 (10MB) |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | image/jpeg,image/png,image/jpg |
| `FRONTEND_URL` | Web frontend URL for CORS | http://localhost:5173 |
| `MOBILE_APP_URL` | Mobile app URL for CORS | exp://localhost:8081 |

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

## Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Seed database with sample data**
   ```bash
   npm run seed
   ```

3. **Monitor logs**
   The server provides detailed logging for all requests and errors.

## License

This project is part of the Cattle Breed Recognition capstone project.