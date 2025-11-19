import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiError } from './types';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: This enables sending cookies with requests
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor (can be used for adding auth tokens, logging, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add Bearer token from localStorage if available (for compatibility)
    // Backend also supports cookies via withCredentials
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = error.response.data || {
        success: false,
        message: 'An error occurred',
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default apiClient;
