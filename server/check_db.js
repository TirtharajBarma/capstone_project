import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const count = await db.collection('predictions').countDocuments();
  console.log(`Total predictions: ${count}`);
  const docs = await db.collection('predictions').find().sort({createdAt:-1}).limit(5).toArray();
  for (const doc of docs) {
    console.log(`Breed: ${doc.predictedBreed}, CreatedAt: ${doc.createdAt}, UserId: ${doc.userId}`);
  }
  process.exit(0);
}
check();
