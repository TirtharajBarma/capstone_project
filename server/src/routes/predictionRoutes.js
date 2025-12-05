import express from 'express';
import { 
  predictBreed, 
  getPrediction, 
  getModelHealth,
  savePrediction,
  toggleFavorite
} from '../controllers/predictionController.js';
import { uploadSingle, handleUploadError, validateImageUpload } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/predict
// @desc    Make breed prediction from uploaded image
// @access  Public
router.post('/', 
  uploadSingle,
  handleUploadError,
  validateImageUpload,
  predictBreed
);

// @route   POST /api/predict/save
// @desc    Save a previously unpersisted prediction
// @access  Public
router.post('/save', savePrediction);

// @route   PUT /api/predict/:id/favorite
// @desc    Toggle favorite status for a prediction
// @access  Private
router.put('/:id/favorite', toggleFavorite);

// @route   GET /api/predict/health
// @desc    Check ML model service health
// @access  Public
router.get('/health', getModelHealth);

// @route   GET /api/predict/:id
// @desc    Get specific prediction by ID
// @access  Public
router.get('/:id', getPrediction);

export default router;