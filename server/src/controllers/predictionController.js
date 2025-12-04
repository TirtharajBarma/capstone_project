import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { Prediction, Breed, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Make prediction using ML model
// @route   POST /api/predict
// @access  Public
export const predictBreed = asyncHandler(async (req, res) => {
  const { buffer, originalname, mimetype, size } = req.file;
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.connection.remoteAddress;
  const clerkIdHeader = (req.get('X-Clerk-Id') || '').trim();
  const saveToDb = req.query.saveToDb !== 'false'; // Default true, false if explicitly set
  
  try {
    // Validate file type via magic numbers
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !['image/jpeg', 'image/png', 'image/jpg'].includes(type.mime)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only JPEG and PNG images are allowed.',
            error: 'INVALID_FILE_TYPE'
        });
    }

    // Create FormData to send to ML model
    const formData = new FormData();
    formData.append('image', buffer, {
      filename: originalname,
      contentType: mimetype
    });

    // Sending image to ML model API...
    
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

    // ML Model Response received

    if (!breed || confidence === undefined) {
      throw new Error('Invalid response from ML model');
    }

    // Validate confidence score
    if (confidence < 0 || confidence > 1) {
      throw new Error('Invalid confidence score from ML model');
    }

    // Map ML model species output to database format
    let mappedSpecies = 'cattle'; // default
    if (species === 'cow') {
      mappedSpecies = 'cattle';
    } else if (species === 'buffalo') {
      mappedSpecies = 'buffalo';
    } else if (species === 'unknown') {
      mappedSpecies = 'unknown';
    }

    // Prepare prediction data
    const predictionData = {
      predictedBreed: breed,
      confidence: parseFloat(confidence),
      species: mappedSpecies,
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
    };

    let savedPrediction = null;
    let attachedUserId = null;

    // Only save to DB if saveToDb is true
    if (saveToDb) {
      // Create prediction record
      const prediction = new Prediction(predictionData);

      // Attach user if Clerk ID is provided
      if (clerkIdHeader) {
        try {
          const userDoc = await User.findOne({ clerkId: clerkIdHeader }).select('_id');
          if (userDoc) {
            attachedUserId = userDoc._id;
            prediction.userId = userDoc._id;
          }
        } catch (e) {
          console.warn('Could not resolve Clerk user for prediction:', e.message);
        }
      }

      // Save prediction to database
      savedPrediction = await prediction.save();

      // If we attached a user, atomically increment their counters
      if (attachedUserId) {
        try {
          await User.findByIdAndUpdate(attachedUserId, {
            $inc: { 'stats.totalPredictions': 1 },
            $set: { 'stats.lastActive': new Date() }
          });
        } catch (e) {
          console.warn('Failed to increment user stats after prediction:', e.message);
        }
      }
    }

    // Batch fetch breed metadata for primary and top predictions to avoid N+1 queries
    const top3 = (top_predictions || [{ breed, confidence }]).slice(0, 3);
    const namesToFetch = Array.from(new Set([breed, ...top3.map((tp) => tp.breed)]));
    let docs = [];
    try {
      docs = await Breed.find({
        species: mappedSpecies === 'unknown' ? 'cattle' : mappedSpecies, // Default to cattle for unknown
        $or: namesToFetch.map((n) => ({ name: new RegExp(`^${n}$`, 'i') }))
      }).select('name species origin description traits characteristics location');
    } catch (e) {
      console.warn('Batch breed meta query failed:', e.message);
    }

    const docMap = new Map(
      docs.map((d) => [String(d.name).toLowerCase(), d])
    );

    const toMeta = (name, sp) => {
      const key = String(name).toLowerCase();
      const doc = docMap.get(key);
      if (!doc) {
        return {
          name,
          species: sp || mappedSpecies || 'cattle',
          origin: null,
          description: null,
          traits: [],
          characteristics: { size: null, color: [], horns: null },
          location: null
        };
      }
      return {
        name: doc.name,
        species: doc.species,
        origin: doc.origin || null,
        description: doc.description || null,
        traits: Array.isArray(doc.traits) ? doc.traits : [],
        characteristics: {
          size: doc.characteristics?.size || null,
          color: Array.isArray(doc.characteristics?.color) ? doc.characteristics.color : [],
          color: Array.isArray(doc.characteristics?.color) ? doc.characteristics.color : [],
          horns: doc.characteristics?.horns || null
        },
        location: doc.location || null
      };
    };

    const primaryBreedInfo = toMeta(breed, species);
    const enrichedTop = top3.map((tp) => ({
      breed: tp.breed,
      confidence: tp.confidence,
      breedInfo: toMeta(tp.breed, species)
    }));

    // Prepare response
    const response = {
      success: true,
      data: {
        predictionId: savedPrediction?._id || null,
        breed: breed,
        confidence: confidence,
        confidencePercentage: Math.round(confidence * 100 * 100) / 100,
        species: mappedSpecies,
        inferenceTime: inference_time_ms,
        timestamp: savedPrediction?.createdAt || new Date(),
        breedInfo: primaryBreedInfo,
        topPredictions: enrichedTop,
        saved: saveToDb,
        // Include prediction data for later saving if not saved
        ...(!saveToDb && { unsavedPredictionData: predictionData })
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
        message: error.response.data?.message || error.response.data?.detail || 'Error from ML model service',
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

// @desc    Save a previously unpersisted prediction
// @route   POST /api/predictions/save
// @access  Public (requires clerkId)
export const savePrediction = asyncHandler(async (req, res) => {
  const { predictionData, clerkId } = req.body;

  if (!predictionData || !clerkId) {
    return res.status(400).json({
      success: false,
      message: 'Prediction data and Clerk ID are required'
    });
  }

  try {
    // Find or create user
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create a minimal user record - will be updated on next sync
      user = new User({
        clerkId: clerkId,
        name: 'User',
        isActive: true
      });
      await user.save();
    }

    // Prevent duplicate save ONLY if searchTimestamp matches
    // This allows the same breed/image to be saved in different search sessions
    let existing = null;
    
    if (predictionData.searchTimestamp) {
      // If we have a searchTimestamp, only check for that specific search session
      existing = await Prediction.findOne({
        userId: user._id,
        predictedBreed: predictionData.predictedBreed,
        confidence: predictionData.confidence,
        'imageMetadata.originalName': predictionData.imageMetadata?.originalName || undefined,
        searchTimestamp: predictionData.searchTimestamp
      }).lean();
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        data: {
          predictionId: existing._id,
          breed: existing.predictedBreed,
          confidence: existing.confidence,
          timestamp: existing.createdAt
        },
        message: 'Duplicate save prevented; returning existing prediction'
      });
    }

    // Create and save prediction
    const prediction = new Prediction({
      ...predictionData,
      userId: user._id
    });

    const savedPrediction = await prediction.save();

    // Increment user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'stats.totalPredictions': 1 },
      $set: { 'stats.lastActive': new Date() }
    });

    res.status(201).json({
      success: true,
      data: {
        predictionId: savedPrediction._id,
        breed: savedPrediction.predictedBreed,
        confidence: savedPrediction.confidence,
        timestamp: savedPrediction.createdAt
      },
      message: 'Prediction saved successfully'
    });
  } catch (error) {
    console.error('Save prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save prediction',
      error: error.message
    });
  }
});