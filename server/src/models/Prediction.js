import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Optional for anonymous users
  },
  sessionId: {
    type: String,
    trim: true
  },
  predictedBreed: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  species: {
    type: String,
    required: true,
    enum: ['cattle', 'buffalo', 'unknown'],
    lowercase: true
  },
  imageMetadata: {
    originalName: String,
    mimetype: String,
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  imageUrl: {
    type: String,
    trim: true
  },
  modelMetadata: {
    inferenceTime: {
      type: Number, // in milliseconds
      min: 0
    },
    modelVersion: {
      type: String,
      trim: true
    },
    topPredictions: [{
      breed: String,
      confidence: Number
    }]
  },
  userFeedback: {
    isCorrect: {
      type: Boolean,
      default: null
    },
    actualBreed: {
      type: String,
      trim: true
    },
    comments: {
      type: String,
      trim: true
    }
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
predictionSchema.index({ predictedBreed: 1 });
predictionSchema.index({ species: 1 });
predictionSchema.index({ confidence: -1 });
predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ userId: 1, species: 1 });
predictionSchema.index({ userId: 1, predictedBreed: 1 });
predictionSchema.index({ sessionId: 1, createdAt: -1 });

// Virtual for confidence percentage
predictionSchema.virtual('confidencePercentage').get(function() {
  return Math.round(this.confidence * 100 * 100) / 100; // Round to 2 decimal places
});

// Virtual for time since prediction
predictionSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Ensure virtual fields are serialized
predictionSchema.set('toJSON', { virtuals: true });

// Static method to get prediction statistics
predictionSchema.statics.getStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalPredictions: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        uniqueBreeds: { $addToSet: '$predictedBreed' },
        speciesDistribution: {
          $push: '$species'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalPredictions: 1,
        avgConfidence: { $round: ['$avgConfidence', 3] },
        uniqueBreedsCount: { $size: '$uniqueBreeds' },
        speciesDistribution: {
          cattle: {
            $size: {
              $filter: {
                input: '$speciesDistribution',
                cond: { $eq: ['$$this', 'cattle'] }
              }
            }
          },
          buffalo: {
            $size: {
              $filter: {
                input: '$speciesDistribution',
                cond: { $eq: ['$$this', 'buffalo'] }
              }
            }
          }
        }
      }
    }
  ]);
};

const Prediction = mongoose.model('Prediction', predictionSchema);

export default Prediction;