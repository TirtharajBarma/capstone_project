/**
 * API Endpoints Configuration
 * Single source of truth for all API endpoints
 * Change endpoints here and they'll update everywhere
 */

const API_ENDPOINTS = {
  // Prediction endpoints
  PREDICT: '/predict',
  PREDICT_SAVE: '/predict/save',
  PREDICT_BY_ID: (id) => `/predict/${id}`,
  PREDICT_HEALTH: '/predict/health',

  // Upload endpoints
  UPLOAD_IMAGE: '/upload',

  // Breed endpoints
  BREEDS: '/breeds',
  BREED_BY_ID: (id) => `/breeds/${id}`,
  BREED_BY_NAME: (name) => `/breeds/name/${name}`,
  BREED_BY_SPECIES: (species) => `/breeds/species/${species}`,
  BREED_SEARCH: '/breeds/search',
  BREED_STATS: '/breeds/stats',

  // History endpoints
  HISTORY: '/history',
  HISTORY_STATS: '/history/stats',
  HISTORY_RECENT: '/history/recent',
  HISTORY_DELETE: (id) => `/history/${id}`,

  // User endpoints
  USER_SYNC: '/users/sync',
  USER_PROFILE: (clerkId) => `/users/profile/${clerkId}`,
  USER_PREFERENCES: (clerkId) => `/users/preferences/${clerkId}`,
  USER_STATS: (clerkId) => `/users/stats/${clerkId}`,
  USER_ANALYTICS: (clerkId) => `/users/analytics/${clerkId}`,
  USER_INCREMENT_PREDICTION: (clerkId) => `/users/increment-prediction/${clerkId}`,

  // Health check
  HEALTH: '/health',
};

export default API_ENDPOINTS;
