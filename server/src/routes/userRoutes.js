import express from 'express';
import {
  getUserProfile,
  syncUserFromClerk,
  updateUserPreferences,
  getUserStats,
  incrementPredictionCount,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Get user profile by Clerk ID
router.get('/profile/:clerkId', getUserProfile);

// Sync user data from Clerk (create or update)
router.post('/sync', syncUserFromClerk);

// Update user preferences
router.put('/preferences/:clerkId', updateUserPreferences);

// Get user statistics
router.get('/stats/:clerkId', getUserStats);

// Increment prediction count
router.post('/increment-prediction/:clerkId', incrementPredictionCount);

// Delete user account
router.delete('/:clerkId', deleteUser);

export default router;