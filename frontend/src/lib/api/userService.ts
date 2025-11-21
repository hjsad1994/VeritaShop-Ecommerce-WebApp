import apiClient from './apiClient';
import type { User, ApiResponse } from './types';
import type { AxiosRequestConfig } from 'axios';

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * User Service - Handles user-related API calls
 */
export const userService = {
  /**
   * Get current user information
   * @param config Optional axios config
   * @returns Promise with user data
   */
  async getCurrentUser(config?: AxiosRequestConfig): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/me', config);
      return response.data;
    } catch (error: unknown) {
      // Re-throw with more context
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error instanceof Error ? error.message : undefined) ||
        'Failed to get current user';
      throw new Error(errorMessage);
    }
  },

  /**
   * Update user profile
   * @param data - Profile update data
   * @returns Promise with updated user data
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return response.data;
  },
};

export default userService;

