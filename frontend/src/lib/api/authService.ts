import apiClient from './apiClient';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from './types';

/**
 * Auth Service - Handles authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param data - Registration data (email, password, name)
   * @returns Promise with user data
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>(
      '/auth/register',
      data,
      { withCredentials: true } // Include HTTP-only cookies
    );
    return response.data;
  },

  /**
   * Login a user
   * @param data - Login credentials (email, password)
   * @returns Promise with user data and sets httpOnly cookies
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data,
      { withCredentials: true } // Include HTTP-only cookies
    );
    return response.data;
  },

  /**
   * Logout the current user
   * @returns Promise with success message
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/logout',
      {},
      { withCredentials: true } // Include HTTP-only cookies
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @returns Promise with new tokens
   */
  async refreshToken(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(
      '/auth/refresh-token',
      {},
      { withCredentials: true, _skipRedirect: true } // Include HTTP-only cookies and skip redirect on failure
    );
    return response.data;
  },

  /**
   * Get current user information
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.get<ApiResponse<LoginResponse>>(
      '/users/me',
      { withCredentials: true } // Include HTTP-only cookies
    );
    return response.data;
  },
};
