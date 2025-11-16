import { Review } from '@prisma/client';
import {
  ReviewRepository,
  CreateReviewData,
  UpdateReviewData,
  ReviewQueryOptions,
  CreateReviewImageData,
  CreateReviewResponseData,
  UpdateReviewResponseData,
} from '../repositories/ReviewRepository';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

// Response interfaces
export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * ReviewService - Business logic layer for Review entity
 * Handles validation, authorization, and orchestrates repository operations
 */
export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor(reviewRepository: ReviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  /**
   * Get all reviews with filtering and pagination
   */
  async getReviews(options: ReviewQueryOptions = {}): Promise<ReviewListResponse> {
    try {
      // Validate and sanitize pagination params
      const page = Math.max(1, options.page || 1);
      const limit = Math.min(Math.max(1, options.limit || 10), 100);

      const { reviews, total } = await this.reviewRepository.findAll({
        ...options,
        page,
        limit,
      });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error in getReviews:', error);
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
   * Get single review by ID
   */
  async getReviewById(id: string): Promise<Review> {
    try {
      const review = await this.reviewRepository.findById(id);

      if (!review) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      return review;
    } catch (error) {
      logger.error('Error in getReviewById:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.REVIEW_NOT_FOUND) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Create a new review (requires purchase)
   */
  async createReview(
    userId: string,
    data: Omit<CreateReviewData, 'userId'>
  ): Promise<Review> {
    try {
      // Validate rating
      if (data.rating < 1 || data.rating > 5) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Đánh giá phải từ 1 đến 5 sao'
        );
      }

      // Validate images count
      if (data.images && data.images.length > 5) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.REVIEW_IMAGE_LIMIT
        );
      }

      // Create review
      const review = await this.reviewRepository.create({
        ...data,
        userId,
      });

      // Update product rating asynchronously
      this.reviewRepository
        .updateProductRating(data.productId)
        .catch((err) => logger.error('Error updating product rating:', err));

      logger.info(`Review created: ${review.id} by user ${userId}`);

      return review;
    } catch (error) {
      logger.error('Error in createReview:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.REVIEW_ALREADY_EXISTS) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          ERROR_MESSAGES.REVIEW_ALREADY_EXISTS
        );
      }
      if ((error as Error).message === ERROR_MESSAGES.REVIEW_MUST_PURCHASE) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.REVIEW_MUST_PURCHASE
        );
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Update an existing review (user can only update own review)
   */
  async updateReview(
    userId: string,
    reviewId: string,
    data: UpdateReviewData,
    isAdmin: boolean = false
  ): Promise<Review> {
    try {
      // Get existing review
      const existingReview = await this.reviewRepository.findById(reviewId);

      if (!existingReview) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      // Check authorization (user can only update own review unless admin)
      if (!isAdmin && existingReview.userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.REVIEW_UNAUTHORIZED
        );
      }

      // Validate rating if provided
      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          'Đánh giá phải từ 1 đến 5 sao'
        );
      }

      // Update review
      const updatedReview = await this.reviewRepository.update(reviewId, data);

      // Update product rating if rating changed
      if (data.rating !== undefined) {
        this.reviewRepository
          .updateProductRating(existingReview.productId)
          .catch((err) => logger.error('Error updating product rating:', err));
      }

      logger.info(`Review updated: ${reviewId} by user ${userId}`);

      return updatedReview;
    } catch (error) {
      logger.error('Error in updateReview:', error);
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
   * Delete a review (user can only delete own review unless admin)
   */
  async deleteReview(
    userId: string,
    reviewId: string,
    isAdmin: boolean = false
  ): Promise<void> {
    try {
      // Get existing review
      const existingReview = await this.reviewRepository.findById(reviewId);

      if (!existingReview) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      // Check authorization
      if (!isAdmin && existingReview.userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.REVIEW_UNAUTHORIZED
        );
      }

      // Delete review
      await this.reviewRepository.delete(reviewId);

      // Update product rating
      this.reviewRepository
        .updateProductRating(existingReview.productId)
        .catch((err) => logger.error('Error updating product rating:', err));

      logger.info(`Review deleted: ${reviewId} by user ${userId}`);
    } catch (error) {
      logger.error('Error in deleteReview:', error);
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
   * Add an image to a review
   */
  async addReviewImage(
    userId: string,
    reviewId: string,
    imageUrl: string
  ): Promise<void> {
    try {
      // Get existing review
      const review = await this.reviewRepository.findById(reviewId);

      if (!review) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      // Check authorization
      if (review.userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.REVIEW_UNAUTHORIZED
        );
      }

      // Get current image count
      const imageCount = (review as any).images?.length || 0;

      // Add image
      await this.reviewRepository.addImage({
        reviewId,
        imageUrl,
        sortOrder: imageCount,
      });

      logger.info(`Image added to review ${reviewId}`);
    } catch (error) {
      logger.error('Error in addReviewImage:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.REVIEW_IMAGE_LIMIT) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          ERROR_MESSAGES.REVIEW_IMAGE_LIMIT
        );
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Remove an image from a review
   */
  async removeReviewImage(userId: string, imageId: string): Promise<void> {
    try {
      // Get image with review
      const image = await this.reviewRepository.getImageById(imageId);

      // Check authorization
      if ((image.review as any).userId !== userId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          ERROR_MESSAGES.REVIEW_UNAUTHORIZED
        );
      }

      // Remove image
      await this.reviewRepository.removeImage(imageId);

      logger.info(`Image ${imageId} removed from review`);
    } catch (error) {
      logger.error('Error in removeReviewImage:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if ((error as Error).message === ERROR_MESSAGES.REVIEW_IMAGE_NOT_FOUND) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.REVIEW_IMAGE_NOT_FOUND
        );
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Mark a review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      // Check if review exists
      const review = await this.reviewRepository.findById(reviewId);

      if (!review) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      // Increment helpful counter
      await this.reviewRepository.incrementHelpful(reviewId);

      logger.info(`Review ${reviewId} marked as helpful`);
    } catch (error) {
      logger.error('Error in markHelpful:', error);
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
   * Create a response to a review (admin/manager only)
   */
  async createResponse(
    adminId: string,
    reviewId: string,
    content: string
  ): Promise<void> {
    try {
      // Check if review exists
      const review = await this.reviewRepository.findById(reviewId);

      if (!review) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.REVIEW_NOT_FOUND);
      }

      // Create response
      await this.reviewRepository.createResponse({
        reviewId,
        userId: adminId,
        content,
      });

      logger.info(`Response created for review ${reviewId} by admin ${adminId}`);
    } catch (error) {
      logger.error('Error in createResponse:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if (
        (error as Error).message === ERROR_MESSAGES.REVIEW_RESPONSE_ALREADY_EXISTS
      ) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          ERROR_MESSAGES.REVIEW_RESPONSE_ALREADY_EXISTS
        );
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }

  /**
   * Update a review response (admin/manager only)
   */
  async updateResponse(
    adminId: string,
    responseId: string,
    content: string
  ): Promise<void> {
    try {
      // Update response
      await this.reviewRepository.updateResponse(responseId, { content });

      logger.info(`Response ${responseId} updated by admin ${adminId}`);
    } catch (error) {
      logger.error('Error in updateResponse:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      if (
        (error as Error).message === ERROR_MESSAGES.REVIEW_RESPONSE_NOT_FOUND
      ) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_MESSAGES.REVIEW_RESPONSE_NOT_FOUND
        );
      }
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_ERROR
      );
    }
  }
}
