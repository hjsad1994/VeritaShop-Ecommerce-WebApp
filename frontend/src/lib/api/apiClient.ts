import axios, { AxiosError, AxiosInstance } from 'axios';
import type { ApiError } from './types';
import { authService } from './authService';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined. Please set it in your frontend .env file.');
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL,
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

// Extend axios config type to include retry flag and skipRedirect
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _skipRedirect?: boolean;
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
        
        // If the request URL is exactly the refresh token endpoint, do not retry
        if (originalRequest.url === '/auth/refresh-token' || originalRequest.url?.endsWith('/auth/refresh-token')) {
             if (typeof window !== 'undefined') {
                // Clear local storage
                localStorage.removeItem('verita-user');
                
                // Only redirect to login if it wasn't a background check
                if (originalRequest._skipRedirect !== true && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
              }
             return Promise.reject(error);
        }

        originalRequest._retry = true; // Mark that we've tried to refresh

        try {
          // Attempt to refresh the token
          await authService.refreshToken();
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, the user needs to log in again
          if (originalRequest._skipRedirect !== true) {
             console.error('Token refresh failed:', refreshError);
          }

          // Only redirect if we're in the browser
          if (typeof window !== 'undefined') {
            // Clear local storage
            localStorage.removeItem('verita-user');
            
            // Only redirect to login if it wasn't a background check
            if (originalRequest._skipRedirect !== true && !window.location.pathname.includes('/login')) {
                 window.location.href = '/login';
            }
          }

          // Instead of rejecting which causes unhandled errors in components, 
          // we return a resolved promise with a specific structure that services can check
          // or we make sure the rejection is handled gracefully. 
          // However, for consistency with existing code which expects rejection on error:
          return Promise.reject({
             ...refreshError,
             isAuthError: true // Tag this error so consumers can ignore it if needed
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
