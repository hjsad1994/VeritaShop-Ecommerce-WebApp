import { Comment } from '@prisma/client';
import {
  CommentRepository,
  CreateCommentData,
  UpdateCommentData,
  CommentQueryOptions,
} from '../repositories/CommentRepository';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

// Response interfaces
export interface CommentListResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * CommentService - Business logic layer for Comment entity
 * Handles validation, authorization, and orchestrates repository operations
 */
export class CommentService {
  private commentRepository: CommentRepository;

  constructor(commentRepository: CommentRepository) {
    this.commentRepository = commentRepository;
  }

  /**
   * Get all comments with filtering and pagination
   */
  async getComments(options: CommentQueryOptions = {}): Promise<CommentListResponse> {
    try {
      // Validate and sanitize pagination params
      const page = Math.max(1, options.page || 1);
      const limit = Math.min(Math.max(1, options.limit || 20), 100);

      const { comments, total } = await this.commentRepository.findAll({
        ...options,
        page,
        limit,
      });

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getComments:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Get single comment by ID with replies
   */
  async getCommentById(id: string): Promise<Comment> {
    try {
      const comment = await this.commentRepository.findByIdWithReplies(id);

      if (!comment) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.COMMENT_NOT_FOUND);
      }

      return comment;
    } catch (error) {
      logger.error('Error in getCommentById:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.COMMENT_NOT_FOUND) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.COMMENT_NOT_FOUND);
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Create a new comment or reply
   */
  async createComment(
    userId: string,
    data: Omit<CreateCommentData, 'userId'>
  ): Promise<Comment> {
    try {
      // Validate content length
      if (!data.content || data.content.trim().length === 0) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Nội dung bình luận không được để trống'
        );
      }

      if (data.content.length > 1000) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Nội dung bình luận không được vượt quá 1000 ký tự'
        );
      }

      // Create comment
      const comment = await this.commentRepository.create({
        ...data,
        userId,
      });

      logger.info(`Comment created: ${comment.id} by user ${userId}`);

      return comment;
    } catch (error) {
      logger.error('Error in createComment:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.COMMENT_PARENT_NOT_FOUND) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.COMMENT_PARENT_NOT_FOUND
        );
      }
      if ((error as Error).message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Update comment content (owner only, or admin/manager)
   */
  async updateComment(
    userId: string,
    commentId: string,
    data: UpdateCommentData,
    isAdmin: boolean = false
  ): Promise<Comment> {
    try {
      // Validate content
      if (!data.content || data.content.trim().length === 0) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Nội dung bình luận không được để trống'
        );
      }

      if (data.content.length > 1000) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Nội dung bình luận không được vượt quá 1000 ký tự'
        );
      }

      // Get existing comment
      const existingComment = await this.commentRepository.findById(commentId);

      if (!existingComment) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.COMMENT_NOT_FOUND);
      }

      // Check authorization (user can only update own comment unless admin)
      if (!isAdmin && existingComment.userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.COMMENT_UNAUTHORIZED
        );
      }

      // Update comment
      const updatedComment = await this.commentRepository.update(commentId, data);

      logger.info(`Comment updated: ${commentId} by user ${userId}`);

      return updatedComment;
    } catch (error) {
      logger.error('Error in updateComment:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Delete comment (owner only, or admin/manager)
   * Cascade deletes all replies automatically
   */
  async deleteComment(
    userId: string,
    commentId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    try {
      // Get existing comment
      const existingComment = await this.commentRepository.findById(commentId);

      if (!existingComment) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.COMMENT_NOT_FOUND);
      }

      // Check authorization (user can only delete own comment unless admin)
      if (!isAdmin && existingComment.userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.COMMENT_UNAUTHORIZED
        );
      }

      // Delete comment (cascade deletes replies)
      await this.commentRepository.delete(commentId);

      logger.info(`Comment deleted: ${commentId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in deleteComment:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }
}
