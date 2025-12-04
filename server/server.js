import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import { predictionRoutes, breedRoutes, historyRoutes, userRoutes, webhookRoutes, uploadRoutes } from './src/routes/index.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  'MONGODB_URI', 
  'CLERK_WEBHOOK_SECRET', 
  'MODEL_API_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Trust proxy for deployment behind reverse proxy (Nginx)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cattle Breed Recognition API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/predict', predictionRoutes);
app.use('/api/breeds', breedRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/upload', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Cattle Breed Recognition API',
    version: '1.0.0',
    documentation: {
      predict: '/api/predict - POST image for breed prediction',
      breeds: '/api/breeds - GET all breeds information',
      history: '/api/history - GET prediction history',
      health: '/health - API health status'
    },
    endpoints: {
      prediction: {
        predict: 'POST /api/predict',
        getById: 'GET /api/predict/:id',
        health: 'GET /api/predict/health'
      },
      breeds: {
        getAll: 'GET /api/breeds',
        getById: 'GET /api/breeds/:id',
        getByName: 'GET /api/breeds/name/:name',
        getBySpecies: 'GET /api/breeds/species/:species',
        search: 'GET /api/breeds/search?q=query',
        stats: 'GET /api/breeds/stats'
      },
      history: {
        getHistory: 'GET /api/history',
        getStats: 'GET /api/history/stats',
        getRecent: 'GET /api/history/recent',
        deleteById: 'DELETE /api/history/:id'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Cattle Breed Recognition Server is running!
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 Port: ${PORT}
🔗 Local URL: http://localhost:${PORT}
📚 API Documentation: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
