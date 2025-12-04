import mongoose from 'mongoose';

const breedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['cattle', 'buffalo'],
    lowercase: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  traits: [{
    type: String,
    trim: true
  }],
  milkYield: {
    average: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      default: 'liters/day'
    }
  },
  imageURL: {
    type: String,
    trim: true
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    region: { type: String, trim: true }
  },
  characteristics: {
    size: {
      type: String,
      enum: ['small', 'medium', 'large']
    },
    color: [{
      type: String,
      trim: true
    }],
    horns: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searches
breedSchema.index({ name: 1, species: 1 });
breedSchema.index({ species: 1 });

// Virtual for full description
breedSchema.virtual('fullDescription').get(function() {
  return `${this.name} is a ${this.species} breed from ${this.origin}. ${this.description}`;
});

// Ensure virtual fields are serialized
breedSchema.set('toJSON', { virtuals: true });

const Breed = mongoose.model('Breed', breedSchema);

export default Breed;