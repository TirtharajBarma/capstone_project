import { Prediction } from '../models/index.js';
import { getUserFromClerkId } from '../utils/user.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get prediction history
// @route   GET /api/history
// @access  Public
export const getPredictionHistory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    species,
    breed,
    minConfidence,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    userId,
    clerkId,
    sessionId
  } = req.query;

  // Build query
  const query = {};
  
  // Filter by user if provided
  // If authenticated, force filter by the authenticated user's ID
  // Note: Since we use requireAuth middleware, req.auth.userId should be present.
  // If we ever allow public access again, we would need to handle that.
  if (req.auth?.userId) {
    const user = await getUserFromClerkId(req.auth.userId);
    if (user) {
      query.userId = user._id;
    } else {
      // If user not found in our DB, they have no history
      return res.status(200).json({
        success: true,
        data: {
          predictions: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: parseInt(limit),
            hasNextPage: false,
            hasPrevPage: false
          },
          filters: {}
        }
      });
    }
  } else {
    // If not authenticated (and middleware allowed it), or for some reason userId is missing
    // In strict mode, middleware catches this.
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access to history'
    });
  }

  if (species) {
    query.species = species.toLowerCase();
  }

  if (breed) {
    query.predictedBreed = new RegExp(breed, 'i');
  }

  if (minConfidence) {
    query.confidence = { $gte: parseFloat(minConfidence) };
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (sessionId) {
    query.sessionId = sessionId;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  try {
    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-imageMetadata.buffer -userAgent -ipAddress -__v')
        .lean(),
      Prediction.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    // Enrich predictions with breed info using helper function (batch operation)
    const { enrichPredictionsWithBreedInfo } = await import('../utils/breedEnrichment.js');
    const enrichedPredictions = await enrichPredictionsWithBreedInfo(predictions);

    // Add virtual fields
    const predictionsWithVirtuals = enrichedPredictions.map(prediction => ({
      ...prediction,
      confidencePercentage: Math.round(prediction.confidence * 100 * 100) / 100,
      timeAgo: getTimeAgo(prediction.createdAt)
    }));

    res.status(200).json({
      success: true,
      data: {
        predictions: predictionsWithVirtuals,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          species,
          breed,
          minConfidence,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching prediction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction history',
      error: 'FETCH_HISTORY_ERROR'
    });
  }
});

// @desc    Get prediction statistics
// @route   GET /api/history/stats
// @access  Public
export const getPredictionStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, species, userId, clerkId } = req.query;

  // Build date filter
  const dateFilter = {};
  
  // Filter by user if provided
  if (req.auth?.userId) {
    const user = await getUserFromClerkId(req.auth.userId);
    if (user) {
      dateFilter.userId = user._id;
    } else {
      // Return empty stats
      return res.status(200).json({
        success: true,
        data: {
          totalPredictions: 0,
          avgConfidence: 0,
          minConfidence: 0,
          maxConfidence: 0,
          uniqueBreedsCount: 0,
          speciesDistribution: { cattle: 0, buffalo: 0 },
          topBreeds: [],
          confidenceDistribution: [],
          dailyStats: [],
          dailyAccuracy: []
        }
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access to stats'
    });
  }
  
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  if (species) {
    dateFilter.species = species.toLowerCase();
  }

  try {
    const [basicStats, breedDistribution, confidenceStats, dailyCount, dailyAccuracy] = await Promise.all([
      // Basic statistics
      Prediction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalPredictions: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' },
            minConfidence: { $min: '$confidence' },
            maxConfidence: { $max: '$confidence' },
            uniqueBreeds: { $addToSet: '$predictedBreed' },
            speciesDistribution: { $push: '$species' }
          }
        }
      ]),

      // Breed distribution
      Prediction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$predictedBreed',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' },
            species: { $first: '$species' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Confidence distribution
      Prediction.aggregate([
        { $match: dateFilter },
        {
          $bucket: {
            groupBy: '$confidence',
            boundaries: [0, 0.5, 0.7, 0.85, 0.95, 1],
            default: 'other',
            output: {
              count: { $sum: 1 },
              avgConfidence: { $avg: '$confidence' }
            }
          }
        }
      ]),

      // Daily prediction count
      Prediction.aggregate([
        {
          $match: {
            ...dateFilter
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Daily average confidence
      Prediction.aggregate([
        { $match: { ...dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            avgConfidence: { $avg: '$confidence' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Process basic stats
    const stats = basicStats[0] || {
      totalPredictions: 0,
      avgConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      uniqueBreeds: [],
      speciesDistribution: []
    };

    // Count species distribution
    const cattleCount = stats.speciesDistribution.filter(s => s === 'cattle').length;
    const buffaloCount = stats.speciesDistribution.filter(s => s === 'buffalo').length;

    const result = {
      totalPredictions: stats.totalPredictions,
      avgConfidence: Math.round(stats.avgConfidence * 100 * 100) / 100,
      minConfidence: Math.round(stats.minConfidence * 100 * 100) / 100,
      maxConfidence: Math.round(stats.maxConfidence * 100 * 100) / 100,
      uniqueBreedsCount: stats.uniqueBreeds.length,
      speciesDistribution: {
        cattle: cattleCount,
        buffalo: buffaloCount
      },
      topBreeds: breedDistribution.map(breed => ({
        ...breed,
        avgConfidence: Math.round(breed.avgConfidence * 100 * 100) / 100
      })),
      confidenceDistribution: confidenceStats,
      dailyStats: dailyCount,
      dailyAccuracy: dailyAccuracy.map(d => ({
        date: d._id,
        accuracy: Math.round(d.avgConfidence * 100 * 100) / 100,
        count: d.count
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error getting prediction statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prediction statistics',
      error: 'STATS_ERROR'
    });
  }
});

// @desc    Get recent predictions
// @route   GET /api/history/recent
// @access  Public
export const getRecentPredictions = asyncHandler(async (req, res) => {
  const { limit = 10, species } = req.query;

  const query = {};

  if (req.auth?.userId) {
    const user = await getUserFromClerkId(req.auth.userId);
    if (user) {
      query.userId = user._id;
    } else {
        return res.status(200).json({
            success: true,
            data: []
        });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access to recent predictions'
    });
  }

  if (species) {
    query.species = species.toLowerCase();
  }

  try {
    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('predictedBreed confidence species createdAt')
      .lean();

    const predictionsWithVirtuals = predictions.map(prediction => ({
      ...prediction,
      confidencePercentage: Math.round(prediction.confidence * 100 * 100) / 100,
      timeAgo: getTimeAgo(prediction.createdAt)
    }));

    res.status(200).json({
      success: true,
      message: 'Recent predictions retrieved successfully',
      data: predictionsWithVirtuals
    });
  } catch (error) {
    console.error('Error fetching recent predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent predictions',
      error: 'FETCH_RECENT_ERROR'
    });
  }
});

// @desc    Delete prediction by ID
// @route   DELETE /api/history/:id
// @access  Public (in production, you might want to restrict this)
export const deletePrediction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prediction = await Prediction.findById(id);

  if (!prediction) {
    return res.status(404).json({
      success: false,
      message: 'Prediction not found',
      error: 'PREDICTION_NOT_FOUND'
    });
  }

  // Ensure user owns the prediction
  if (req.auth?.userId) {
    const user = await getUserFromClerkId(req.auth.userId);
    if (!user || prediction.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this prediction',
        error: 'UNAUTHORIZED_ACCESS'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized to delete this prediction'
    });
  }

  await Prediction.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Prediction deleted successfully'
  });
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}