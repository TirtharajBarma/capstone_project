import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Prediction API
export const predictionAPI = {
  // Upload image for breed prediction
  predict: async (imageFile, onProgress) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      };
    }

    const response = await api.post('/predict', formData, config);
    return response.data;
  },

  // Get prediction by ID
  getById: async (predictionId) => {
    const response = await api.get(`/predict/${predictionId}`);
    return response.data;
  },

  // Check ML model health
  checkHealth: async () => {
    const response = await api.get('/predict/health');
    return response.data;
  },
};

// Breeds API
export const breedsAPI = {
  // Get all breeds
  getAll: async (params = {}) => {
    const response = await api.get('/breeds', { params });
    return response.data;
  },

  // Get breed by ID
  getById: async (breedId) => {
    const response = await api.get(`/breeds/${breedId}`);
    return response.data;
  },

  // Get breed by name
  getByName: async (name, species) => {
    const params = species ? { species } : {};
    const response = await api.get(`/breeds/name/${name}`, { params });
    return response.data;
  },

  // Get breeds by species
  getBySpecies: async (species, params = {}) => {
    const response = await api.get(`/breeds/species/${species}`, { params });
    return response.data;
  },

  // Search breeds
  search: async (query, species = null) => {
    const params = { q: query };
    if (species) params.species = species;
    const response = await api.get('/breeds/search', { params });
    return response.data;
  },

  // Get breed statistics
  getStats: async () => {
    const response = await api.get('/breeds/stats');
    return response.data;
  },
};

// History API
export const historyAPI = {
  // Get prediction history
  getHistory: async (params = {}) => {
    const response = await api.get('/history', { params });
    return response.data;
  },

  // Get prediction statistics
  getStats: async (params = {}) => {
    const response = await api.get('/history/stats', { params });
    return response.data;
  },

  // Get recent predictions
  getRecent: async (limit = 10, species = null) => {
    const params = { limit };
    if (species) params.species = species;
    const response = await api.get('/history/recent', { params });
    return response.data;
  },

  // Delete prediction
  delete: async (predictionId) => {
    const response = await api.delete(`/history/${predictionId}`);
    return response.data;
  },
};

// Utility functions
export const utils = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate image file
  validateImageFile: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, JPG, or PNG images only.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload images smaller than 5MB.');
    }

    return true;
  },

  // Create image URL from file
  createImageURL: (file) => {
    return URL.createObjectURL(file);
  },

  // Cleanup image URL
  revokeImageURL: (url) => {
    URL.revokeObjectURL(url);
  },
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      message: data.message || 'An error occurred',
      error: data.error || 'API_ERROR',
      status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      error: 'NETWORK_ERROR',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
      status: 0,
    };
  }
};

export default api;