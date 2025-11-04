import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'researcher', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    species: {
      type: String,
      enum: ['cattle', 'buffalo', 'both'],
      default: 'both'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    totalPredictions: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Update lastActive on save
userSchema.pre('save', function(next) {
  this.stats.lastActive = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;