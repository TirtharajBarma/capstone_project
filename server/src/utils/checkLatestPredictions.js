import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Prediction } from '../models/index.js';

dotenv.config();

const checkPredictions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(5);
    
    console.log('Latest 5 Predictions:');
    predictions.forEach(p => {
      console.log({
        id: p._id,
        breed: p.predictedBreed,
        imageUrl: p.imageUrl,
        hasImageMetadata: !!p.imageMetadata,
        createdAt: p.createdAt
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPredictions();
