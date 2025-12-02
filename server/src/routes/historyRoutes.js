import express from 'express';
import {
  getPredictionHistory,
  getPredictionStats,
  getRecentPredictions,
  deletePrediction
} from '../controllers/historyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/history/stats
// @desc    Get prediction statistics
// @access  Protected
router.get('/stats', requireAuth, getPredictionStats);

// @route   GET /api/history/recent
// @desc    Get recent predictions
// @access  Protected
router.get('/recent', requireAuth, getRecentPredictions);

// @route   DELETE /api/history/:id
// @desc    Delete prediction by ID
// @access  Protected
router.delete('/:id', requireAuth, deletePrediction);

// @route   GET /api/history
// @desc    Get prediction history with filtering and pagination
// @access  Protected
router.get('/', requireAuth, getPredictionHistory);

export default router;
