import apiClient from './apiClient';
import type { ApiResponse, User } from './types';

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.data.user;
  }
}

export const userService = new UserService();
export default userService;

