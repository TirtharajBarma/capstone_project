/**
 * API Endpoints Configuration
 * Single source of truth for all API endpoints
 * Change endpoints here and they'll update everywhere
 */

const API_ENDPOINTS = {
  // Prediction endpoints
  PREDICT: '/predict',
  PREDICT_SAVE: '/predict/save',
  PREDICT_BY_ID: (id) => `/predictions/${id}`,
  PREDICT_DELETE: (id) => `/predictions/${id}`,
  PREDICT_FAVORITE: (id) => `/predict/${id}/favorite`,

  // Upload endpoints
  UPLOAD_IMAGE: '/upload',

  // Breed endpoints
  BREEDS: '/breeds',
  BREED_BY_NAME: (name) => `/breeds/name/${name}`,
  BREED_SEARCH: '/breeds/search',

  // History endpoints
  HISTORY: '/history',
  HISTORY_BY_USER: (clerkId) => `/history/${clerkId}`,
  HISTORY_STATS: '/history/stats',

  // User endpoints
  USER_SYNC: '/users/sync',
  USER_PROFILE: (clerkId) => `/users/profile/${clerkId}`,
  USER_PREFERENCES: (clerkId) => `/users/preferences/${clerkId}`,
  USER_STATS: (clerkId) => `/users/stats/${clerkId}`,
  USER_ANALYTICS: (clerkId) => `/users/analytics/${clerkId}`,
};

export default API_ENDPOINTS;
