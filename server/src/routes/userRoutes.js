import express from 'express';
import {
  getUserProfile,
  syncUserFromClerk,
  updateUserPreferences,
  getUserStats,
  getUserAnalytics,
  incrementPredictionCount,
  deleteUser
} from '../controllers/userController.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';

const router = express.Router();

// Sync user data from Clerk (create or update)
// This is called by frontend after sign-in.
// Protected to ensure only authenticated users can sync their own data.
router.post('/sync', requireAuth, syncUserFromClerk);

// Get user profile by Clerk ID
router.get('/profile/:clerkId', requireAuth, requireOwner, getUserProfile);

// Update user preferences
router.put('/preferences/:clerkId', requireAuth, requireOwner, updateUserPreferences);

// Get user statistics
router.get('/stats/:clerkId', requireAuth, requireOwner, getUserStats);

// Get user analytics (for dashboard)
router.get('/analytics/:clerkId', requireAuth, requireOwner, getUserAnalytics);

// Increment prediction count
// This is typically internal but if exposed via API it should be protected
router.post('/increment-prediction/:clerkId', requireAuth, requireOwner, incrementPredictionCount);

// Delete user account
router.delete('/:clerkId', requireAuth, requireOwner, deleteUser);

export default router;
