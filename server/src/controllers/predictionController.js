import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import mongoose from 'mongoose';
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
  let saveToDb = req.query.saveToDb !== 'false'; // Default true, false if explicitly set
    
    // Override saveToDb if MongoDB is not connected
    if (saveToDb && mongoose.connection.readyState !== 1) {
      console.log('⚠️  MongoDB not connected, skipping save...');
      saveToDb = false;
    }
  
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
    formData.append('file', buffer, {
      filename: originalname,
      contentType: mimetype
    });

    // DEBUG LOG
    console.log(`🔍 Request received. PREDICTION_MODE is: "${process.env.PREDICTION_MODE}"`);

    let breed, confidence, inference_time_ms, species, top_predictions;

    // CHECK FOR AI BYPASS
    if (process.env.PREDICTION_MODE === 'AI') {
      const startTime = Date.now();
      console.log('🔮 Using AI Bypass Mode (OpenRouter)...');

      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is missing in backend environment');
      }

      const base64Image = buffer.toString('base64');
      const dataUri = `data:${mimetype};base64,${base64Image}`;

      const aiModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

      const aiResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: aiModel,
          temperature: 0,
          top_p: 1,
          max_tokens: 2000,
          // response_format: { type: "json_object" }, // Unsupported by many vision models
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image carefully. First, determine if it contains cattle (cow or buffalo).

                  IMPORTANT: If the image does NOT contain cattle (e.g., it's a person, object, computer screen, landscape, etc.), return:
                  {
                    "breed": "N/A",
                    "confidence": 0,
                    "species": "unknown",
                    "breed_info": {
                      "origin": null,
                      "description": "No cattle detected in image",
                      "traits": [],
                      "characteristics": {
                        "size": null,
                        "color": [],
                        "horns": null
                      }
                    },
                    "top_predictions": []
                  }

                  If the image DOES contain cattle, identify the breed and provide detailed information.

                  Return ONLY a valid JSON object (no markdown formatting) with this EXACT structure:
                  {
                    "breed": "string",
                    "confidence": number (0-1),
                    "species": "string",
                    "breed_info": {
                      "origin": "string (country/region of origin)",
                      "description": "string (2-3 sentences about the breed)",
                      "traits": ["string array of key traits/characteristics"],
                      "characteristics": {
                        "size": "string (small/medium/large)",
                        "color": ["string array of colors"],
                        "horns": "string (horn description or 'Polled' if no horns)"
                      }
                    },
                    "top_predictions": [{
                      "breed": "string",
                      "confidence": number,
                      "breed_info": { /* same structure as above */ }
                    }]
                  }

                  The species must be either 'cow' or 'buffalo'. If unsure or no cattle present, set to 'unknown'.
                  Only provide breed information if you're confident the image contains actual cattle.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: dataUri
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cattle-breed-recognition.com', // Optional but recommended for OpenRouter
            'X-Title': 'Cattle Breed Recognition'
          }
        }
      );

      const aiContent = aiResponse.data.choices[0].message.content;
      console.log('🤖 AI Raw Response:', JSON.stringify(aiResponse.data, null, 2));

      if (!aiContent) {
        throw new Error('AI returned empty content. Check server logs for details.');
      }

      // Clean markdown if present (e.g. ```json ... ```)
      const jsonStr = aiContent.replace(/```json\n?|\n?```/g, '').trim();
      
      let aiBreedInfo = null;
      let aiTopPredictionsWithInfo = null;
      
      try {
        const parsed = JSON.parse(jsonStr);
        breed = parsed.breed;
        confidence = parsed.confidence;
        species = parsed.species;
        top_predictions = parsed.top_predictions;
        inference_time_ms = Date.now() - startTime;
        
        // Store AI-provided breed info for later use
        aiBreedInfo = parsed.breed_info || null;
        aiTopPredictionsWithInfo = parsed.top_predictions || null;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('AI returned invalid JSON');
      }
      
      // Store in a variable to use later instead of database lookup
      req.aiBreedInfo = aiBreedInfo;
      req.aiTopPredictionsWithInfo = aiTopPredictionsWithInfo;

    } else {
      // STANDARD ML MODEL PATH
      console.log('⚙️ Using Standard ML Model path...');
      
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

      // Destructure from model response
      ({ breed, confidence, inference_time_ms, species, top_predictions } = modelResponse.data);
    }


    // ML Model/AI Response received

    if (!breed || confidence === undefined) {
      throw new Error('Invalid response from prediction service');
    }

    // Validate confidence score
    if (confidence < 0 || confidence > 1) {
      // Some models might return percentage 0-100, normalize if needed or throw
      // Assuming 0-1 for now based on previous code
      if (confidence > 1 && confidence <= 100) {
        confidence = confidence / 100;
      } else if (confidence > 100) {
         throw new Error('Invalid confidence score from prediction service');
      }
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
    // BUT: If AI mode provided breed_info, use that instead of database lookup
    const top3 = (top_predictions || [{ breed, confidence }]).slice(0, 3);
    const namesToFetch = Array.from(new Set([breed, ...top3.map((tp) => tp.breed)]));
    
    let docs = [];
    let useAIBreedInfo = false;
    
    // Check if we have AI-provided breed info (from AI mode)
    if (req.aiBreedInfo && req.aiTopPredictionsWithInfo) {
      useAIBreedInfo = true;
      console.log('✨ Using AI-provided breed information');
    }
    
    // Always fetch from database to get Location data (which AI doesn't provide)
    try {
      docs = await Breed.find({
        species: mappedSpecies === 'unknown' ? 'cattle' : mappedSpecies,
        $or: namesToFetch.map((n) => ({ name: new RegExp(`^${n}$`, 'i') }))
      }).select('name species origin description traits characteristics location');
    } catch (e) {
      console.warn('Batch breed meta query failed:', e.message);
    }

    const docMap = new Map(
      docs.map((d) => [String(d.name).toLowerCase(), d])
    );

    const toMeta = (name, sp, aiInfo = null) => {
      // If AI provided breed info, use it
      if (aiInfo) {
        // Try to find in DB to backfill location if missing (hybrid approach)
        const key = String(name).toLowerCase();
        const doc = docMap.get(key);

        return {
          name,
          species: sp || mappedSpecies || 'cattle',
          origin: aiInfo.origin || null,
          description: aiInfo.description || null,
          traits: Array.isArray(aiInfo.traits) ? aiInfo.traits : [],
          characteristics: {
            size: aiInfo.characteristics?.size || null,
            color: Array.isArray(aiInfo.characteristics?.color) ? aiInfo.characteristics.color : [],
            horns: aiInfo.characteristics?.horns || null
          },
          location: doc ? doc.location : null // Use DB location if available
        };
      }
      
      // Otherwise, use database lookup
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
          horns: doc.characteristics?.horns || null
        },
        location: doc.location || null
      };
    };

    // Build breed info - use AI-provided info if available
    const primaryBreedInfo = toMeta(breed, species, useAIBreedInfo ? req.aiBreedInfo : null);
    
    const enrichedTop = top3.map((tp, index) => {
      // Find matching AI breed info if available
      let aiInfo = null;
      if (useAIBreedInfo && req.aiTopPredictionsWithInfo && req.aiTopPredictionsWithInfo[index]) {
        aiInfo = req.aiTopPredictionsWithInfo[index].breed_info || null;
      }
      
      return {
        breed: tp.breed,
        confidence: tp.confidence,
        breedInfo: toMeta(tp.breed, species, aiInfo)
      };
    });

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
        message: 'Prediction service is currently unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
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
        // Log more details from OpenRouter/Model error
         console.error('Upstream API Data:', error.response.data);
         
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || error.response.data?.error?.message || 'Error from prediction service',
        error: 'UPSTREAM_API_ERROR'
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

    // Try to save prediction (skip if DB unavailable)
    let savedPrediction = null;
    try {
      const prediction = new Prediction({
        ...predictionData,
        userId: user._id
      });
      savedPrediction = await prediction.save();

      // Increment user stats
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.totalPredictions': 1 },
        $set: { 'stats.lastActive': new Date() }
      });
    } catch (dbError) {
      console.log('⚠️  Could not save to DB, returning prediction only');
    }

    res.status(201).json({
      success: true,
      data: {
        predictionId: savedPrediction?._id || null,
        breed: predictionData.predictedBreed,
        confidence: predictionData.confidence,
        timestamp: savedPrediction?.createdAt || new Date().toISOString()
      },
      message: savedPrediction ? 'Prediction saved successfully' : 'Prediction returned (DB unavailable)'
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

// @desc    Toggle favorite status for a prediction
// @route   PUT /api/predict/:id/favorite
// @access  Private (requires user)
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { clerkId, isFavorite } = req.body;

  if (!clerkId) {
    return res.status(400).json({
      success: false,
      message: 'Clerk ID is required'
    });
  }

  try {
    // Find user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find prediction and verify ownership
    const prediction = await Prediction.findOne({ _id: id, userId: user._id });
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found or unauthorized'
      });
    }

    // Toggle favorite status
    const newFavoriteStatus = typeof isFavorite === 'boolean' ? isFavorite : !prediction.isFavorite;
    const wasFavorite = prediction.isFavorite;
    
    prediction.isFavorite = newFavoriteStatus;
    await prediction.save();

    // Update user's favorite count
    if (newFavoriteStatus && !wasFavorite) {
      // Added to favorites
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.totalFavorites': 1 }
      });
    } else if (!newFavoriteStatus && wasFavorite) {
      // Removed from favorites
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.totalFavorites': -1 }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        predictionId: prediction._id,
        isFavorite: prediction.isFavorite
      },
      message: prediction.isFavorite ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
});