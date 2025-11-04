import axios from 'axios';
import FormData from 'form-data';
import { Prediction, Breed } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Make prediction using ML model
// @route   POST /api/predict
// @access  Public
export const predictBreed = asyncHandler(async (req, res) => {
  const { buffer, originalname, mimetype, size } = req.file;
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    // Create FormData to send to ML model
    const formData = new FormData();
    formData.append('image', buffer, {
      filename: originalname,
      contentType: mimetype
    });

    console.log('Sending image to ML model API...');
    
    // Send request to ML model API
    const modelResponse = await axios.post(process.env.MODEL_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
      },
      timeout: parseInt(process.env.MODEL_API_TIMEOUT) || 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const { breed, confidence, inference_time_ms, species, top_predictions } = modelResponse.data;

    console.log('ML Model Response:', modelResponse.data);

    if (!breed || confidence === undefined) {
      throw new Error('Invalid response from ML model');
    }

    // Validate confidence score
    if (confidence < 0 || confidence > 1) {
      throw new Error('Invalid confidence score from ML model');
    }

    // Create prediction record
    const prediction = new Prediction({
      predictedBreed: breed,
      confidence: parseFloat(confidence),
      species: species || 'cattle', // Default to cattle if not specified
      imageMetadata: {
        originalName: originalname,
        mimetype: mimetype,
        size: size
      },
      modelMetadata: {
        inferenceTime: inference_time_ms || null,
        topPredictions: top_predictions || [{ breed, confidence }]
      },
      ipAddress,
      userAgent,
      sessionId: req.sessionID || req.get('X-Session-ID') || null
    });

    // Save prediction to database
    const savedPrediction = await prediction.save();

    // Try to get additional breed information
    let breedInfo = null;
    try {
      breedInfo = await Breed.findOne({ 
        name: new RegExp(`^${breed}$`, 'i'),
        species: species || 'cattle'
      });
    } catch (error) {
      console.warn('Could not fetch breed information:', error.message);
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        predictionId: savedPrediction._id,
        breed: breed,
        confidence: confidence,
        confidencePercentage: Math.round(confidence * 100 * 100) / 100,
        species: species || 'cattle',
        inferenceTime: inference_time_ms,
        timestamp: savedPrediction.createdAt,
        breedInfo: breedInfo ? {
          name: breedInfo.name,
          origin: breedInfo.origin,
          description: breedInfo.description,
          traits: breedInfo.traits,
          characteristics: breedInfo.characteristics
        } : null,
        topPredictions: top_predictions?.slice(0, 3) || null // Limit to top 3
      },
      message: `Prediction completed with ${Math.round(confidence * 100)}% confidence`
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Prediction error:', error);

    // Handle specific axios errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'ML model service is currently unavailable. Please try again later.',
        error: 'MODEL_SERVICE_UNAVAILABLE'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Prediction request timed out. Please try again with a smaller image.',
        error: 'PREDICTION_TIMEOUT'
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || 'Error from ML model service',
        error: 'MODEL_API_ERROR'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Failed to process image prediction',
      error: 'PREDICTION_ERROR'
    });
  }
});

// @desc    Get prediction by ID
// @route   GET /api/predict/:id
// @access  Public
export const getPrediction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prediction = await Prediction.findById(id).populate({
    path: 'predictedBreed',
    model: 'Breed',
    match: { name: { $regex: new RegExp(`^${prediction?.predictedBreed}$`, 'i') } },
    select: 'name origin description traits characteristics'
  });

  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found',
      error: 'PREDICTION_NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: prediction
  });
});

// @desc    Get model health/status
// @route   GET /api/predict/health
// @access  Public
export const getModelHealth = asyncHandler(async (req, res) => {
  try {
    const healthResponse = await axios.get(
      process.env.MODEL_API_URL.replace('/predict', '/health'),
      { timeout: 5000 }
    );

    res.status(200).json({
      success: true,
      data: {
        modelStatus: 'online',
        ...healthResponse.data
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'ML model service is unavailable',
      data: {
        modelStatus: 'offline',
        error: error.message
      }
    });
  }
});