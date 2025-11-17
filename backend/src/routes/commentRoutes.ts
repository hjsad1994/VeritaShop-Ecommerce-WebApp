import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { CommentValidation } from '../validations/CommentValidation';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

/**
 * Creates and configures comment routes
 * @returns Configured Express Router for comment endpoints
 */
export const createCommentRoutes = (): Router => {
  const router = Router();
  const controller = new CommentController();

  // ========== PUBLIC ROUTES ==========

  /**
   * GET /api/comments
   * Get comments for a product with pagination
   * Query params: productId, userId, page, limit, sortBy
   * Authentication: Public (no login required)
   */
  router.get(
    '/',
    validate(CommentValidation.queryComments()),
    controller.getComments
  );

  /**
   * GET /api/comments/:id
   * Get single comment with nested replies
   * Authentication: Public (no login required)
   */
  router.get('/:id', controller.getCommentById);

  // ========== AUTHENTICATED USER ROUTES ==========

  /**
   * POST /api/comments
   * Create a comment or reply
   * Authentication: Required (user must be logged in)
   * Body: { productId, content, parentId? }
   */
  router.post(
    '/',
    authenticate,
    validate(CommentValidation.create()),
    controller.createComment
  );

  /**
   * PUT /api/comments/:id
   * Update own comment content
   * Authentication: Required (owner only, or admin/manager)
   * Body: { content }
   */
  router.put(
    '/:id',
    authenticate,
    validate(CommentValidation.update()),
    controller.updateComment
  );

  /**
   * DELETE /api/comments/:id
   * Delete comment with cascade delete replies
   * Authentication: Required (owner only, or admin/manager)
   */
  router.delete('/:id', authenticate, controller.deleteComment);

  return router;
};
