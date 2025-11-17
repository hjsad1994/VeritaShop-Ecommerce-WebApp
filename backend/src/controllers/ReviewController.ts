import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService';
import { ReviewDto } from '../dtos/ReviewDto';
import { ServiceFactory } from '../services';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

/**
 * ReviewController - HTTP request handlers for Review endpoints
 * Handles request/response cycle and delegates business logic to service layer
 */
export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = ServiceFactory.getReviewService();
  }

  /**
   * GET /api/reviews
   * Get all reviews with filtering and pagination
   */
  getReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        productId,
        userId,
        rating,
        isVerified,
        page,
        limit,
        sortBy,
      } = req.query;

      const result = await this.reviewService.getReviews({
        productId: productId as string,
        userId: userId as string,
        rating: rating ? parseInt(rating as string) : undefined,
        isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as any,
      });

      const response = ReviewDto.fromReviewList(
        result.reviews as any,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_REVIEWS_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/reviews/:id
   * Get single review by ID
   */
  getReviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await this.reviewService.getReviewById(id);

      const response = ReviewDto.fromReview(review as any);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_REVIEW_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/reviews
   * Create a new review (authenticated users only, must have purchased)
   */
  createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { productId, rating, title, content, images } = req.body;

      const review = await this.reviewService.createReview(userId, {
        productId,
        rating,
        title,
        content,
        images,
      });

      const response = ReviewDto.fromReview(review as any);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_REVIEW_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/reviews/:id
   * Update an existing review (user can only update own review)
   */
  updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const { rating, title, content } = req.body;

      const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

      const review = await this.reviewService.updateReview(
        userId,
        id,
        { rating, title, content },
        isAdmin
      );

      const response = ReviewDto.fromReview(review as any);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_REVIEW_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/reviews/:id
   * Delete a review (user can only delete own review unless admin)
   */
  deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;

      const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

      await this.reviewService.deleteReview(userId, id, isAdmin);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_REVIEW_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/reviews/:id/images
   * Add an image to a review
   */
  addImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { imageUrl } = req.body;

      await this.reviewService.addReviewImage(userId, id, imageUrl);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Thêm ảnh thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/reviews/images/:imageId
   * Remove an image from a review
   */
  removeImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { imageId } = req.params;

      await this.reviewService.removeReviewImage(userId, imageId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Xóa ảnh thành công',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/reviews/:id/helpful
   * Mark a review as helpful (public endpoint)
   */
  markHelpful = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      await this.reviewService.markHelpful(id);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/reviews/:id/response
   * Create a response to a review (admin/manager only)
   */
  createResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { content } = req.body;

      await this.reviewService.createResponse(adminId, id, content);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_REVIEW_RESPONSE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/reviews/responses/:responseId
   * Update a review response (admin/manager only)
   */
  updateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const { responseId } = req.params;
      const { content } = req.body;

      await this.reviewService.updateResponse(adminId, responseId, content);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_REVIEW_RESPONSE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}
