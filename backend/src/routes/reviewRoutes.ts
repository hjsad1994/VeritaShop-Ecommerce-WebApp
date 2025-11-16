import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { ReviewValidation } from '../validations/ReviewValidation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

/**
 * Create and configure review routes
 */
export const createReviewRoutes = (): Router => {
  const router = Router();
  const controller = new ReviewController();

  // ========== PUBLIC ROUTES ==========

  /**
   * GET /api/reviews
   * Get all reviews with filtering and pagination
   * Query params: productId, userId, rating, isVerified, page, limit, sortBy
   */
  router.get(
    '/',
    validate(ReviewValidation.queryReviews()),
    controller.getReviews
  );

  /**
   * GET /api/reviews/:id
   * Get single review by ID
   */
  router.get('/:id', controller.getReviewById);

  /**
   * POST /api/reviews/:id/helpful
   * Mark a review as helpful (increment helpful counter)
   * Public endpoint - no authentication required
   */
  router.post('/:id/helpful', controller.markHelpful);

  // ========== AUTHENTICATED USER ROUTES ==========

  /**
   * POST /api/reviews
   * Create a new review (requires purchase)
   * Auth: Required
   * Body: { productId, rating, title?, content?, images? }
   */
  router.post(
    '/',
    authenticate,
    validate(ReviewValidation.create()),
    controller.createReview
  );

  /**
   * PUT /api/reviews/:id
   * Update own review (or any review if admin/manager)
   * Auth: Required
   * Body: { rating?, title?, content? }
   */
  router.put(
    '/:id',
    authenticate,
    validate(ReviewValidation.update()),
    controller.updateReview
  );

  /**
   * DELETE /api/reviews/:id
   * Delete own review (or any review if admin/manager)
   * Auth: Required
   */
  router.delete('/:id', authenticate, controller.deleteReview);

  /**
   * POST /api/reviews/:id/images
   * Add an image to own review
   * Auth: Required
   * Body: { imageUrl }
   */
  router.post(
    '/:id/images',
    authenticate,
    validate(ReviewValidation.addImage()),
    controller.addImage
  );

  /**
   * DELETE /api/reviews/images/:imageId
   * Remove an image from own review
   * Auth: Required
   */
  router.delete('/images/:imageId', authenticate, controller.removeImage);

  // ========== ADMIN/MANAGER ONLY ROUTES ==========

  /**
   * POST /api/reviews/:id/response
   * Create a response to a review
   * Auth: Admin or Manager only
   * Body: { content }
   */
  router.post(
    '/:id/response',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(ReviewValidation.createResponse()),
    controller.createResponse
  );

  /**
   * PUT /api/reviews/responses/:responseId
   * Update a review response
   * Auth: Admin or Manager only
   * Body: { content }
   */
  router.put(
    '/responses/:responseId',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(ReviewValidation.updateResponse()),
    controller.updateResponse
  );

  return router;
};
