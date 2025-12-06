import User from '../models/User.js';
import Prediction from '../models/Prediction.js';
import Breed from '../models/Breed.js';

// Get or create user profile
export const getUserProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }

    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create or update user from Clerk data
export const syncUserFromClerk = async (req, res) => {
  try {
    const clerkUserData = req.body;
    
    if (!clerkUserData.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Clerk user data'
      });
    }

    const user = await User.findOrCreateFromClerk(clerkUserData);
    
    res.json({
      success: true,
      data: user,
      message: user.isNew ? 'User created successfully' : 'User updated successfully'
    });
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { preferences } = req.body;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
      await user.save();
    }

    res.json({
      success: true,
      data: user,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { clerkId } = req.params;
    console.log(`Getting stats for user: ${clerkId}`);
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      console.log(`User not found: ${clerkId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        totalPredictions: user.stats?.totalPredictions || 0,
        lastActive: user.stats?.lastActive || user.updatedAt,
        memberSince: user.createdAt,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user analytics for dashboard
export const getUserAnalytics = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { filter } = req.query; // 'all', 'cow', 'buffalo'
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Import Prediction and Breed models
    const { Prediction, Breed } = await import('../models/index.js');

    // Build query based on filter
    const query = { userId: user._id };
    if (filter === 'cow') {
      query.species = 'cattle'; // Map 'cow' to 'cattle'
    } else if (filter === 'buffalo') {
      query.species = 'buffalo';
    }

    // Get user's predictions
    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate analytics
    const totalAnalyses = predictions.length;
    const uniqueBreeds = [...new Set(predictions.map(p => p.predictedBreed))].length;
    const accuracyRate = predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100
      : 0;

    // Species counts (from all predictions, not filtered)
    const allPredictions = await Prediction.find({ userId: user._id }).lean();
    const cowCount = allPredictions.filter(p => p.species === 'cattle').length;
    const buffaloCount = allPredictions.filter(p => p.species === 'buffalo').length;

    // Calculate breed breakdown with counts and percentages
    const breedCounts = {};
    predictions.forEach(pred => {
      const breedKey = pred.predictedBreed;
      if (!breedCounts[breedKey]) {
        breedCounts[breedKey] = {
          breed: pred.predictedBreed,
          species: pred.species,
          count: 0
        };
      }
      breedCounts[breedKey].count += 1;
    });

    const breedBreakdown = Object.values(breedCounts)
      .map(item => ({
        ...item,
        percentage: totalAnalyses > 0 ? Math.round((item.count / totalAnalyses) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Top 5 breeds
    const topBreeds = breedBreakdown.slice(0, 5);

    // Get recent recognitions (last 8) with breed images and complete data
    const recentPredictions = predictions.slice(0, 8);
    
    // Enrich predictions with breed info using helper function (batch operation)
    const { enrichPredictionsWithBreedInfo } = await import('../utils/breedEnrichment.js');
    const enrichedPredictions = await enrichPredictionsWithBreedInfo(recentPredictions);
    
    // Format for response
    const recentRecognitions = enrichedPredictions.map(pred => {
      const imageToUse = pred.imageUrl || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(pred.predictedBreed);
      
      return {
        id: pred._id,
        breed: pred.predictedBreed,
        species: pred.species,
        confidence: Math.round(pred.confidence * 100),
        timestamp: pred.createdAt,
        breedImage: imageToUse,
        imageUrl: imageToUse,
        isFavorite: pred.isFavorite || false,
        topPredictions: pred.modelMetadata?.topPredictions || [],
        inferenceTime: pred.modelMetadata?.inferenceTime
      };
    });

    res.json({
      success: true,
      data: {
        totalAnalyses,
        uniqueBreeds,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
        cowCount,
        buffaloCount,
        totalFavorites: user.stats?.totalFavorites || 0,
        breedBreakdown,
        topBreeds,
        recentRecognitions
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Increment prediction count
export const incrementPredictionCount = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        $inc: { 'stats.totalPredictions': 1 },
        $set: { 'stats.lastActive': new Date() }
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.stats,
      message: 'Prediction count updated'
    });
  } catch (error) {
    console.error('Increment prediction count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user account
export const deleteUser = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOneAndDelete({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};