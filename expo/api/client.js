import axios from 'axios';
import Constants from 'expo-constants';
import API_ENDPOINTS from '../constants/endpoints';

// Get API URL from environment
const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for Clerk's getToken function
let clerkGetToken = null;

// Set Clerk token getter
export const setClerkTokenGetter = (getTokenFn) => {
  clerkGetToken = getTokenFn;
};

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  async (config) => {
    if (clerkGetToken) {
      try {
        const token = await clerkGetToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.debug('No Clerk token available:', err.message);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - user may need to sign in');
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getProfile: async (clerkId) => {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE(clerkId));
    return response.data;
  },

  syncUser: async (clerkUserData) => {
    const response = await api.post(API_ENDPOINTS.USER_SYNC, clerkUserData);
    return response.data;
  },

  updatePreferences: async (clerkId, preferences) => {
    const response = await api.put(API_ENDPOINTS.USER_PREFERENCES(clerkId), { preferences });
    return response.data;
  },

  getStatistics: async (clerkId) => {
    const response = await api.get(API_ENDPOINTS.USER_STATS(clerkId));
    return response.data;
  },

  getAnalytics: async (clerkId, filter = 'all') => {
    const response = await api.get(`${API_ENDPOINTS.USER_ANALYTICS(clerkId)}?filter=${filter}`);
    return response.data;
  },
};

// Prediction API
export const predictionAPI = {
  predict: async (formData) => {
    console.log('🔌 [API] Calling predict endpoint...');
    console.log('🔌 [API] Base URL:', API_URL);
    
    try {
      const response = await api.post(API_ENDPOINTS.PREDICT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('🔌 [API] Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔌 [API] Error in predict:', error);
      console.error('🔌 [API] Error response:', error.response?.data);
      throw error;
    }
  },

  getHistory: async (clerkId, limit = 10, skip = 0) => {
    const response = await api.get(API_ENDPOINTS.HISTORY, {
      params: { limit, page: 1 },
    });
    return response.data;
  },

  getById: async (predictionId) => {
    const response = await api.get(API_ENDPOINTS.PREDICT_BY_ID(predictionId));
    return response.data;
  },

  delete: async (predictionId) => {
    const response = await api.delete(API_ENDPOINTS.PREDICT_DELETE(predictionId));
    return response.data;
  },

  save: async (predictionData, clerkId) => {
    const response = await api.post(API_ENDPOINTS.PREDICT_SAVE, {
      predictionData,
      clerkId
    });
    return response.data;
  },

  toggleFavorite: async (predictionId, clerkId, isFavorite) => {
    const response = await api.put(API_ENDPOINTS.PREDICT_FAVORITE(predictionId), {
      clerkId,
      isFavorite
    });
    return response.data;
  },

  uploadImage: async (formData) => {
    console.log('🔌 [API] Uploading image to Cloudinary...');
    
    try {
      const response = await api.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('🔌 [API] Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔌 [API] Error uploading image:', error);
      console.error('🔌 [API] Error response:', error.response?.data);
      throw error;
    }
  },
};

// Breed API
export const breedAPI = {
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.BREEDS);
    return response.data;
  },

  getByName: async (name) => {
    const response = await api.get(API_ENDPOINTS.BREED_BY_NAME(name));
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(API_ENDPOINTS.BREED_SEARCH, {
      params: { q: query },
    });
    return response.data;
  },
};

// History API
export const historyAPI = {
  getHistory: async (clerkId, filters = {}) => {
    const response = await api.get(API_ENDPOINTS.HISTORY_BY_USER(clerkId), {
      params: filters,
    });
    return response.data;
  },

  getStats: async (clerkId) => {
    const response = await api.get(API_ENDPOINTS.HISTORY_STATS);
    return response.data;
  },
};

// Error handler helper
export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    return 'No response from server. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api;
