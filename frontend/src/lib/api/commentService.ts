import apiClient from './apiClient';
import { 
  ApiResponse, 
  Comment, 
  CommentListResponse, 
  CommentQueryParams, 
  CreateCommentRequest, 
  UpdateCommentRequest 
} from './types';

export const commentService = {
  /**
   * Get comments for a product
   */
  getComments: async (params: CommentQueryParams): Promise<CommentListResponse> => {
    const response = await apiClient.get<ApiResponse<CommentListResponse>>('/comments', {
      params,
    });
    return response.data.data;
  },

  /**
   * Create a new comment or reply
   */
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      '/comments',
      data,
      { withCredentials: true }
    );
    return response.data.data;
  },

  /**
   * Update a comment
   */
  updateComment: async (id: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await apiClient.put<ApiResponse<Comment>>(
      `/comments/${id}`,
      data,
      { withCredentials: true }
    );
    return response.data.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`, {
      withCredentials: true,
    });
  },
};
