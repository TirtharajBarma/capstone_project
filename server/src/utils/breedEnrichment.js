import { Breed } from '../models/index.js';

/**
 * Batch fetch breeds to avoid N+1 queries
 * @param {Array} breedNames - Array of breed names to fetch
 * @param {String} species - Species filter
 * @returns {Map} Map of breed name (lowercase) to breed document
 */
export const batchFetchBreeds = async (breedNames, species) => {
  if (!breedNames || breedNames.length === 0) {
    return new Map();
  }

  try {
    const docs = await Breed.find({
      species: species === 'unknown' ? 'cattle' : species,
      $or: breedNames.map((n) => ({ name: new RegExp(`^${n}$`, 'i') }))
    }).select('name species origin description traits characteristics location').lean();
    
    return new Map(docs.map((d) => [String(d.name).toLowerCase(), d]));
  } catch (error) {
    console.error('Error batch fetching breeds:', error);
    return new Map();
  }
};

/**
 * Build breedInfo object from breed document
 * @param {Object} breedDoc - Breed document from database
 * @param {String} fallbackName - Fallback breed name if doc is null
 * @param {String} fallbackSpecies - Fallback species if doc is null
 * @returns {Object} Formatted breedInfo object
 */
export const buildBreedInfo = (breedDoc, fallbackName = null, fallbackSpecies = 'cattle') => {
  if (!breedDoc) {
    if (!fallbackName) return null;
    return {
      name: fallbackName,
      species: fallbackSpecies,
      origin: null,
      description: null,
      traits: [],
      characteristics: {
        size: null,
        color: [],
        horns: null
      },
      location: null
    };
  }
  
  return {
    name: breedDoc.name,
    species: breedDoc.species,
    origin: breedDoc.origin || null,
    description: breedDoc.description || null,
    traits: Array.isArray(breedDoc.traits) ? breedDoc.traits : [],
    characteristics: {
      size: breedDoc.characteristics?.size || null,
      color: Array.isArray(breedDoc.characteristics?.color) ? breedDoc.characteristics.color : [],
      horns: breedDoc.characteristics?.horns || null
    },
    location: breedDoc.location || null
  };
};

/**
 * Enrich predictions array with breed info (batch operation)
 * @param {Array} predictions - Array of prediction objects
 * @returns {Array} Predictions with enriched topPredictions containing breedInfo
 */
export const enrichPredictionsWithBreedInfo = async (predictions) => {
  if (!predictions || predictions.length === 0) {
    return [];
  }

  // Collect all unique breed names and their species from all predictions
  const breedsBySpecies = new Map(); // Map<species, Set<breedNames>>
  
  predictions.forEach(pred => {
    const species = pred.species || 'cattle';
    
    // Add main breed
    if (!breedsBySpecies.has(species)) {
      breedsBySpecies.set(species, new Set());
    }
    breedsBySpecies.get(species).add(pred.predictedBreed);
    
    // Add breeds from topPredictions
    if (pred.modelMetadata?.topPredictions && Array.isArray(pred.modelMetadata.topPredictions)) {
      pred.modelMetadata.topPredictions.forEach(tp => {
        if (tp.breed) {
          breedsBySpecies.get(species).add(tp.breed);
        }
      });
    }
  });

  // Batch fetch breeds grouped by species (multiple queries, one per species)
  const breedCache = new Map();
  
  for (const [species, breedNamesSet] of breedsBySpecies) {
    const breedNames = Array.from(breedNamesSet);
    const breedsMap = await batchFetchBreeds(breedNames, species);
    breedsMap.forEach((doc, key) => breedCache.set(key, doc));
  }

  // Enrich each prediction
  return predictions.map(prediction => {
    // Enrich topPredictions
    let enrichedTopPredictions = [];
    
    if (prediction.modelMetadata?.topPredictions && Array.isArray(prediction.modelMetadata.topPredictions)) {
      enrichedTopPredictions = prediction.modelMetadata.topPredictions.map(tp => {
        if (tp.breedInfo) return tp; // Already enriched
        
        const breedKey = String(tp.breed).toLowerCase();
        const breedDoc = breedCache.get(breedKey);
        
        return {
          ...tp,
          breedInfo: buildBreedInfo(breedDoc, tp.breed, prediction.species)
        };
      });
    } else {
      // Create topPredictions for old records
      const predBreedKey = String(prediction.predictedBreed).toLowerCase();
      const breedDoc = breedCache.get(predBreedKey);
      
      enrichedTopPredictions = [{
        breed: prediction.predictedBreed,
        confidence: prediction.confidence,
        breedInfo: buildBreedInfo(breedDoc, prediction.predictedBreed, prediction.species)
      }];
    }

    return {
      ...prediction,
      modelMetadata: {
        ...prediction.modelMetadata,
        topPredictions: enrichedTopPredictions
      }
    };
  });
};
