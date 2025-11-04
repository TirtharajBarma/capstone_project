import { Breed } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all breeds
// @route   GET /api/breeds
// @access  Public
export const getAllBreeds = asyncHandler(async (req, res) => {
  const {
    species,
    page = 1,
    limit = 20,
    search,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  const query = { isActive: true };
  
  if (species) {
    query.species = species.toLowerCase();
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { origin: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  try {
    // Execute query with pagination
    const [breeds, total] = await Promise.all([
      Breed.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Breed.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        breeds,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breeds',
      error: 'FETCH_BREEDS_ERROR'
    });
  }
});

// @desc    Get breed by ID
// @route   GET /api/breeds/:id
// @access  Public
export const getBreedById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const breed = await Breed.findById(id).select('-__v');

  if (!breed) {
    return res.status(404).json({
      success: false,
      message: 'Breed not found',
      error: 'BREED_NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: breed
  });
});

// @desc    Get breed by name
// @route   GET /api/breeds/name/:name
// @access  Public
export const getBreedByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { species } = req.query;

  const query = {
    name: new RegExp(`^${name}$`, 'i'),
    isActive: true
  };

  if (species) {
    query.species = species.toLowerCase();
  }

  const breed = await Breed.findOne(query).select('-__v');

  if (!breed) {
    return res.status(404).json({
      success: false,
      message: 'Breed not found',
      error: 'BREED_NOT_FOUND'
    });
  }

  res.status(200).json({
    success: true,
    data: breed
  });
});

// @desc    Get breeds by species
// @route   GET /api/breeds/species/:species
// @access  Public
export const getBreedsBySpecies = asyncHandler(async (req, res) => {
  const { species } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  if (!['cattle', 'buffalo'].includes(species.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid species. Must be either "cattle" or "buffalo"',
      error: 'INVALID_SPECIES'
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  try {
    const [breeds, total] = await Promise.all([
      Breed.find({ species: species.toLowerCase(), isActive: true })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Breed.countDocuments({ species: species.toLowerCase(), isActive: true })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        breeds,
        species: species.toLowerCase(),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching breeds by species:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breeds by species',
      error: 'FETCH_BREEDS_ERROR'
    });
  }
});

// @desc    Search breeds
// @route   GET /api/breeds/search
// @access  Public
export const searchBreeds = asyncHandler(async (req, res) => {
  const { 
    q: searchQuery,
    species,
    limit = 10
  } = req.query;

  if (!searchQuery) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
      error: 'MISSING_SEARCH_QUERY'
    });
  }

  const query = {
    isActive: true,
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { origin: { $regex: searchQuery, $options: 'i' } },
      { traits: { $in: [new RegExp(searchQuery, 'i')] } }
    ]
  };

  if (species) {
    query.species = species.toLowerCase();
  }

  try {
    const breeds = await Breed.find(query)
      .limit(parseInt(limit))
      .select('name species origin description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        breeds,
        searchQuery,
        resultsCount: breeds.length
      }
    });
  } catch (error) {
    console.error('Error searching breeds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search breeds',
      error: 'SEARCH_BREEDS_ERROR'
    });
  }
});

// @desc    Get breed statistics
// @route   GET /api/breeds/stats
// @access  Public
export const getBreedStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Breed.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 },
          avgMilkYield: { $avg: '$milkYield.average' }
        }
      },
      {
        $group: {
          _id: null,
          totalBreeds: { $sum: '$count' },
          speciesBreakdown: {
            $push: {
              species: '$_id',
              count: '$count',
              avgMilkYield: { $round: ['$avgMilkYield', 2] }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalBreeds: 0,
      speciesBreakdown: []
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting breed statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get breed statistics',
      error: 'STATS_ERROR'
    });
  }
});