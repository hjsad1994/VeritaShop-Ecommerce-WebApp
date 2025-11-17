import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { CommentService } from '../services/CommentService';
import { CommentDto } from '../dtos/CommentDto';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

/**
 * CommentController - HTTP request handlers for Comment endpoints
 * Handles request parsing, calls service layer, formats responses
 */
export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = ServiceFactory.getCommentService();
  }

  /**
   * GET /api/comments
   * Get comments for a product with pagination and nested structure
   * Query params: productId, userId, page, limit, sortBy
   */
  getComments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId, userId, page, limit, sortBy } = req.query;

      const result = await this.commentService.getComments({
        productId: productId as string | undefined,
        userId: userId as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as 'newest' | 'oldest' | undefined,
      });

      const response = CommentDto.fromCommentList(
        result.comments as any,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_COMMENTS_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/comments/:id
   * Get single comment with nested replies
   */
  getCommentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const comment = await this.commentService.getCommentById(id);

      const response = CommentDto.fromComment(comment as any);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_COMMENT_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/comments
   * Create a new comment or reply
   * Auth: Required
   * Body: { productId, content, parentId? }
   */
  createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { productId, content, parentId } = req.body;

      const comment = await this.commentService.createComment(userId, {
        productId,
        content,
        parentId,
      });

      const response = CommentDto.fromComment(comment as any);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_COMMENT_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/comments/:id
   * Update own comment content
   * Auth: Required (owner only, or admin/manager)
   */
  updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { content } = req.body;

      const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

      const comment = await this.commentService.updateComment(
        userId,
        id,
        { content },
        isAdmin
      );

      const response = CommentDto.fromComment(comment as any);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_COMMENT_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/comments/:id
   * Delete comment with cascade delete replies
   * Auth: Required (owner only, or admin/manager)
   */
  deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;

      const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

      await this.commentService.deleteComment(userId, id, isAdmin);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_COMMENT_SUCCESS,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
