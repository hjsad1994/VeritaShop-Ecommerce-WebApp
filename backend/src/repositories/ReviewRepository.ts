import { PrismaClient, Review, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { ERROR_MESSAGES } from '../constants';

// Data interfaces
export interface CreateReviewData {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string[]; // Array of image URLs
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
}

export interface ReviewQueryOptions {
  productId?: string;
  userId?: string;
  rating?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface CreateReviewImageData {
  reviewId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface CreateReviewResponseData {
  reviewId: string;
  userId: string;
  content: string;
}

export interface UpdateReviewResponseData {
  content: string;
}

/**
 * ReviewRepository - Data access layer for Review entity
 * Handles all database operations related to reviews
 */
export class ReviewRepository extends BaseRepository<Review> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find all reviews with filtering and pagination
   */
  async findAll(
    options: ReviewQueryOptions = {}
  ): Promise<{ reviews: Review[]; total: number }> {
    const {
      productId,
      userId,
      rating,
      isVerified,
      page = 1,
      limit = 10,
      sortBy = 'newest',
    } = options;

    // Build where clause
    const where: Prisma.ReviewWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (rating) {
      where.rating = rating;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    // Build orderBy clause
    let orderBy: Prisma.ReviewOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating_high':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_low':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Execute queries in parallel
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          response: {
            include: {
              responder: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { reviews, total };
  }

  /**
   * Find review by ID with all relations
   */
  async findById(id: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        response: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new Error(ERROR_MESSAGES.REVIEW_NOT_FOUND);
    }

    return review;
  }

  /**
   * Find review by product and user (check if user already reviewed)
   */
  async findByProductAndUser(
    productId: string,
    userId: string
  ): Promise<Review | null> {
    return await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }

  /**
   * Create a new review with optional images
   */
  async create(data: CreateReviewData): Promise<Review> {
    const { productId, userId, rating, title, content, images } = data;

    return await this.prisma.$transaction(async (tx) => {
      // Check if user already reviewed this product
      const existingReview = await tx.review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
      });

      if (existingReview) {
        throw new Error(ERROR_MESSAGES.REVIEW_ALREADY_EXISTS);
      }

      // Verify user purchased the product
      const hasPurchased = await this.hasUserPurchased(userId, productId);
      if (!hasPurchased) {
        throw new Error(ERROR_MESSAGES.REVIEW_MUST_PURCHASE);
      }

      // Create review
      const review = await tx.review.create({
        data: {
          productId,
          userId,
          rating,
          title,
          content,
          isVerified: hasPurchased,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: true,
          response: {
            include: {
              responder: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Create review images if provided
      if (images && images.length > 0) {
        if (images.length > 5) {
          throw new Error(ERROR_MESSAGES.REVIEW_IMAGE_LIMIT);
        }

        await tx.reviewImage.createMany({
          data: images.map((url, index) => ({
            reviewId: review.id,
            imageUrl: url,
            sortOrder: index,
          })),
        });

        // Fetch images to include in response
        const reviewImages = await tx.reviewImage.findMany({
          where: { reviewId: review.id },
          orderBy: { sortOrder: 'asc' },
        });

        (review as any).images = reviewImages;
      }

      return review;
    });
  }

  /**
   * Update an existing review
   */
  async update(id: string, data: UpdateReviewData): Promise<Review> {
    return await this.prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        response: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Delete a review (soft delete - just remove from database)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  /**
   * Add an image to a review
   */
  async addImage(data: CreateReviewImageData): Promise<void> {
    const { reviewId, imageUrl, sortOrder } = data;

    // Check image count
    const imageCount = await this.prisma.reviewImage.count({
      where: { reviewId },
    });

    if (imageCount >= 5) {
      throw new Error(ERROR_MESSAGES.REVIEW_IMAGE_LIMIT);
    }

    await this.prisma.reviewImage.create({
      data: {
        reviewId,
        imageUrl,
        sortOrder,
      },
    });
  }

  /**
   * Remove an image from a review
   */
  async removeImage(imageId: string): Promise<void> {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error(ERROR_MESSAGES.REVIEW_IMAGE_NOT_FOUND);
    }

    await this.prisma.reviewImage.delete({
      where: { id: imageId },
    });
  }

  /**
   * Increment helpful counter for a review
   */
  async incrementHelpful(id: string): Promise<void> {
    await this.prisma.review.update({
      where: { id },
      data: {
        helpful: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Check if user has purchased a product
   */
  async hasUserPurchased(userId: string, productId: string): Promise<boolean> {
    // Check if user has a DELIVERED order containing this product
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            variant: {
              productId,
            },
          },
        },
      },
    });

    return !!order;
  }

  /**
   * Update product's average rating and review count
   */
  async updateProductRating(productId: string): Promise<void> {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        reviewCount: stats._count.id,
      },
    });
  }

  /**
   * Create a response to a review (admin/manager only)
   */
  async createResponse(data: CreateReviewResponseData): Promise<void> {
    const { reviewId, userId, content } = data;

    // Check if response already exists
    const existingResponse = await this.prisma.reviewResponse.findUnique({
      where: { reviewId },
    });

    if (existingResponse) {
      throw new Error(ERROR_MESSAGES.REVIEW_RESPONSE_ALREADY_EXISTS);
    }

    await this.prisma.reviewResponse.create({
      data: {
        reviewId,
        userId,
        content,
      },
    });
  }

  /**
   * Update a review response
   */
  async updateResponse(
    responseId: string,
    data: UpdateReviewResponseData
  ): Promise<void> {
    const response = await this.prisma.reviewResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      throw new Error(ERROR_MESSAGES.REVIEW_RESPONSE_NOT_FOUND);
    }

    await this.prisma.reviewResponse.update({
      where: { id: responseId },
      data: {
        content: data.content,
      },
    });
  }

  /**
   * Get review image by ID
   */
  async getImageById(imageId: string) {
    const image = await this.prisma.reviewImage.findUnique({
      where: { id: imageId },
      include: {
        review: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!image) {
      throw new Error(ERROR_MESSAGES.REVIEW_IMAGE_NOT_FOUND);
    }

    return image;
  }
}
