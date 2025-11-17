import apiClient from './apiClient';
import type { User, ApiResponse } from './types';

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
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data;
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
import type { ApiResponse, User } from './types';

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.data.user;
  }
}

export const userService = new UserService();
export default userService;

