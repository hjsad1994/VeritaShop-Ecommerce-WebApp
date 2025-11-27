import apiClient from './apiClient';
import type { User, ApiResponse } from './types';
import type { AxiosRequestConfig } from 'axios';

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string | null;
}

export interface AvatarPresignedUrlResponse {
  presignedUrl: string;
  s3Key: string;
  cloudFrontUrl: string;
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

  /**
   * Get presigned URL for avatar upload
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @returns Promise with presigned URL, s3Key, and cloudFrontUrl
   */
  async getAvatarPresignedUrl(fileName: string, contentType: string): Promise<ApiResponse<AvatarPresignedUrlResponse>> {
    const response = await apiClient.post<ApiResponse<AvatarPresignedUrlResponse>>('/users/avatar/presigned-url', {
      fileName,
      contentType,
    });
    return response.data;
  },

  /**
   * Upload avatar file to S3 using presigned URL
   * @param presignedUrl - Presigned URL from getAvatarPresignedUrl
   * @param file - File to upload
   * @returns Promise that resolves when upload is complete
   */
  async uploadAvatarToS3(presignedUrl: string, file: File): Promise<void> {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  /**
   * Delete current avatar
   * @returns Promise with success message
   */
  async deleteAvatar(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>('/users/avatar');
    return response.data;
  },
};

export default userService;

