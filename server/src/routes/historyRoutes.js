import express from 'express';
import {
  getPredictionHistory,
  getPredictionStats,
  getRecentPredictions,
  deletePrediction
} from '../controllers/historyController.js';

const router = express.Router();

// @route   GET /api/history/stats
// @desc    Get prediction statistics
// @access  Public
router.get('/stats', getPredictionStats);

// @route   GET /api/history/recent
// @desc    Get recent predictions
// @access  Public
router.get('/recent', getRecentPredictions);

// @route   DELETE /api/history/:id
// @desc    Delete prediction by ID
// @access  Public
router.delete('/:id', deletePrediction);

// @route   GET /api/history
// @desc    Get prediction history with filtering and pagination
// @access  Public
router.get('/', getPredictionHistory);

export default router;