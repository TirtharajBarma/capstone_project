import axios from 'axios';
import Constants from 'expo-constants';

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
    const response = await api.get(`/users/profile/${clerkId}`);
    return response.data;
  },

  syncUser: async (clerkUserData) => {
    const response = await api.post('/users/sync', clerkUserData);
    return response.data;
  },

  updatePreferences: async (clerkId, preferences) => {
    const response = await api.put(`/users/preferences/${clerkId}`, { preferences });
    return response.data;
  },

  getStatistics: async (clerkId) => {
    const response = await api.get(`/users/stats/${clerkId}`);
    return response.data;
  },

  getAnalytics: async (clerkId) => {
    const response = await api.get(`/users/analytics/${clerkId}`);
    return response.data;
  },
};

// Prediction API
export const predictionAPI = {
  predict: async (formData) => {
    const response = await api.post('/predictions/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async (clerkId, limit = 10, skip = 0) => {
    const response = await api.get(`/predictions/history/${clerkId}`, {
      params: { limit, skip },
    });
    return response.data;
  },

  getById: async (predictionId) => {
    const response = await api.get(`/predictions/${predictionId}`);
    return response.data;
  },

  delete: async (predictionId) => {
    const response = await api.delete(`/predictions/${predictionId}`);
    return response.data;
  },
};

// Breed API
export const breedAPI = {
  getAll: async () => {
    const response = await api.get('/breeds');
    return response.data;
  },

  getByName: async (name) => {
    const response = await api.get(`/breeds/${name}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get('/breeds/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// History API
export const historyAPI = {
  getHistory: async (clerkId, filters = {}) => {
    const response = await api.get(`/history/${clerkId}`, {
      params: filters,
    });
    return response.data;
  },

  getStats: async (clerkId) => {
    const response = await api.get('/history/stats');
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
