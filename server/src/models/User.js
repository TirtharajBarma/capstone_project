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
    let user = await this.findOne({ clerkId: clerkUser.id });
    
    if (!user) {
      // Create new user from Clerk data
      const userData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        imageUrl: clerkUser.imageUrl,
        metadata: {
          signUpProvider: clerkUser.externalAccounts?.length > 0 ? 'oauth' : 'email',
          lastLoginAt: new Date()
        }
      };
      
      user = new this(userData);
      await user.save();
    } else {
      // Update existing user with latest Clerk data
      user.email = clerkUser.emailAddresses?.[0]?.emailAddress || user.email;
      user.firstName = clerkUser.firstName || user.firstName;
      user.lastName = clerkUser.lastName || user.lastName;
      user.name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name;
      user.imageUrl = clerkUser.imageUrl || user.imageUrl;
      user.metadata.lastLoginAt = new Date();
      
      await user.save();
    }
    
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