# Backend Server

Node.js Express server for the Cattle Breed Recognition system.

## Features

- **Image Upload & Processing**: Accept and validate image uploads
- **ML Model Integration**: Forward images to ML model API for breed prediction
- **Database Management**: Store predictions, breed information, and history
- **RESTful API**: Comprehensive API endpoints for frontend integration
- **Error Handling**: Robust error handling and validation
- **CORS Support**: Cross-origin resource sharing for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **HTTP Client**: Axios
- **Environment**: dotenv

## API Endpoints

### Prediction Endpoints
- `POST /api/predict` - Upload image for breed prediction
- `GET /api/predict/:id` - Get specific prediction by ID
- `GET /api/predict/health` - Check ML model service health

### Breed Information Endpoints
- `GET /api/breeds` - Get all breeds with pagination
- `GET /api/breeds/:id` - Get breed by ID
- `GET /api/breeds/name/:name` - Get breed by name
- `GET /api/breeds/species/:species` - Get breeds by species (cattle/buffalo)
- `GET /api/breeds/search?q=query` - Search breeds
- `GET /api/breeds/stats` - Get breed statistics

### History Endpoints
- `GET /api/history` - Get prediction history with filtering
- `GET /api/history/stats` - Get prediction statistics
- `GET /api/history/recent` - Get recent predictions
- `DELETE /api/history/:id` - Delete prediction by ID

### Health Check
- `GET /health` - API health status

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

   # ML Model API Configuration
   MODEL_API_URL=http://127.0.0.1:8000/predict
   MODEL_API_TIMEOUT=30000

   # Upload Configuration
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
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
| `MODEL_API_URL` | ML model API endpoint | http://127.0.0.1:8000/predict |
| `MODEL_API_TIMEOUT` | Request timeout (ms) | 30000 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5242880 |
| `ALLOWED_FILE_TYPES` | Allowed MIME types | image/jpeg,image/png,image/jpg |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

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