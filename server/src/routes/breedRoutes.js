import express from 'express';
import {
  getAllBreeds,
  getBreedById,
  getBreedByName,
  getBreedsBySpecies,
  searchBreeds,
  getBreedStats
} from '../controllers/breedController.js';

const router = express.Router();

// @route   GET /api/breeds/search
// @desc    Search breeds by name, origin, or traits
// @access  Public
router.get('/search', searchBreeds);

// @route   GET /api/breeds/stats
// @desc    Get breed statistics
// @access  Public
router.get('/stats', getBreedStats);

// @route   GET /api/breeds/species/:species
// @desc    Get breeds by species (cattle or buffalo)
// @access  Public
router.get('/species/:species', getBreedsBySpecies);

// @route   GET /api/breeds/name/:name
// @desc    Get breed by name
// @access  Public
router.get('/name/:name', getBreedByName);

// @route   GET /api/breeds/:id
// @desc    Get breed by ID
// @access  Public
router.get('/:id', getBreedById);

// @route   GET /api/breeds
// @desc    Get all breeds with pagination and filtering
// @access  Public
router.get('/', getAllBreeds);

export default router;