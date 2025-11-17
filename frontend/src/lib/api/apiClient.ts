import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiError } from './types';
import { authService } from './authService';

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
    // You can add common headers here if needed
    // For example, if you want to add a custom header:
    // config.headers['X-Custom-Header'] = 'value';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Extend axios config type to include retry flag
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      const originalRequest = error.config;

      // If we get a 401 (Unauthorized) error, try to refresh the token
      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true; // Mark that we've tried to refresh

        try {
          // Attempt to refresh the token
          await authService.refreshToken();
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, the user needs to log in again
          console.error('Token refresh failed:', refreshError);

          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            // Clear local storage and redirect to login
            localStorage.removeItem('verita-user');
            window.location.href = '/login';
          }

          return Promise.reject({
            success: false,
            message: 'Your session has expired. Please log in again.',
          });
        }
      }

      // Server responded with error status (not 401 or token refresh failed)
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

// Export both default and named for compatibility
export default apiClient;
export { apiClient };
