import User from '../models/User.js';

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
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        totalPredictions: user.stats.totalPredictions,
        lastActive: user.stats.lastActive,
        memberSince: user.createdAt,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user analytics for dashboard
export const getUserAnalytics = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Import Prediction and Breed models
    const { Prediction, Breed } = await import('../models/index.js');

    // Get user's predictions
    const predictions = await Prediction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate analytics
    const totalAnalyses = predictions.length;
    const uniqueBreeds = [...new Set(predictions.map(p => p.predictedBreed))].length;
    const accuracyRate = predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100
      : 0;

    // Get recent recognitions (last 8) with breed images
    const recentPredictions = predictions.slice(0, 8);
    const recentRecognitions = await Promise.all(
      recentPredictions.map(async (pred) => {
        const breed = await Breed.findOne({ 
          name: pred.predictedBreed,
          species: pred.species 
        }).select('imageUrl');
        
        return {
          id: pred._id,
          breed: pred.predictedBreed,
          species: pred.species,
          confidence: Math.round(pred.confidence * 100),
          timestamp: pred.createdAt,
          imageUrl: breed?.imageUrl || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(pred.predictedBreed)
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalAnalyses,
        uniqueBreeds,
        accuracyRate: Math.round(accuracyRate * 10) / 10,
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