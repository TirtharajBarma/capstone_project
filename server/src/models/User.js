import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
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
    totalFavorites: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  metadata: {
    signUpProvider: {
      type: String,
      enum: ['email', 'google', 'oauth'],
      default: 'email'
    },
    lastLoginAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Static method to find or create user from Clerk data
userSchema.statics.findOrCreateFromClerk = async function(clerkUser) {
  try {
    const updateData = {
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      imageUrl: clerkUser.imageUrl,
      'metadata.lastLoginAt': new Date()
    };

    // If it's a new user, set these fields (using $setOnInsert)
    // We calculate these outside to keep the update query clean
    const setOnInsert = {
      clerkId: clerkUser.id,
      'metadata.signUpProvider': clerkUser.externalAccounts?.length > 0 ? 'oauth' : 'email',
      'stats.totalPredictions': 0,
      'stats.lastActive': new Date()
    };

    const user = await this.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        $set: updateData,
        $setOnInsert: setOnInsert
      },
      {
        new: true,   // Return the modified document
        upsert: true, // Create if not exists
        runValidators: true
      }
    );
    
    return user;
  } catch (error) {
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

// Update lastActive on save
userSchema.pre('save', function(next) {
  this.stats.lastActive = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;