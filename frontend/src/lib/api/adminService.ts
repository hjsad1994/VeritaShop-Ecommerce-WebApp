import apiClient from './apiClient';
import type { User, ApiResponse, PaginationMeta } from './types';

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  password?: string;
}

interface UserListResponse {
  users: User[];
  pagination: PaginationMeta;
}

/**
 * Admin Service - Handles admin-related API calls for user management
 */
export const adminService = {
  /**
   * Get all users (admin only)
   * @param params - Pagination and filter parameters
   * @returns Promise with users data
   */
  async getAllUsers(params?: GetAllUsersParams): Promise<ApiResponse<UserListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (typeof params?.isActive === 'boolean') queryParams.append('isActive', params.isActive ? 'true' : 'false');
    
    const url = queryParams.toString() ? `/admin/users?${queryParams}` : '/admin/users';
    const response = await apiClient.get<ApiResponse<UserListResponse>>(url, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   * @param id - User ID
   * @returns Promise with user data
   */
  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(`/admin/users/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Update user (admin only)
   * @param id - User ID
   * @param data - User update data
   * @returns Promise with updated user data
   */
  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Delete user (admin only)
   * @param id - User ID
   * @returns Promise with success message
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Create new user (admin only)
   * @param data - User creation data
   * @returns Promise with created user data
   */
  async createUser(data: CreateUserData): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/admin/users', data, {
      withCredentials: true,
    });
    return response.data;
  },
};
