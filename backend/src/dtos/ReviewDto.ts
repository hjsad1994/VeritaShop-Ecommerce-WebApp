import { Review, ReviewImage, ReviewResponse as PrismaReviewResponse, User, Product } from '@prisma/client';

// Response interfaces
export interface ReviewImageResponse {
  id: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: Date;
}

export interface ReviewResponseData {
  id: string;
  content: string;
  responder: {
    id: string;
    name: string | null;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  helpful: number;
  images: ReviewImageResponse[];
  response: ReviewResponseData | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewListResponse {
  reviews: IReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type for Review with all relations
type ReviewWithRelations = Review & {
  user: User;
  product: Product;
  images: ReviewImage[];
  response: (PrismaReviewResponse & { responder: User }) | null;
};

/**
 * ReviewDto - Data Transfer Object for Review entity
 * Transforms Review entities to response format
 */
export class ReviewDto {
  /**
   * Transform a single review to response format
   */
  static fromReview(review: ReviewWithRelations): IReviewResponse {
    return {
      id: review.id,
      productId: review.productId,
      productName: review.product.name,
      productSlug: review.product.slug,
      user: {
        id: review.user.id,
        name: review.user.name,
        avatar: review.user.avatar || null,
      },
      rating: review.rating,
      title: review.title,
      content: review.content,
      isVerified: review.isVerified,
      helpful: review.helpful,
      images: review.images
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          sortOrder: img.sortOrder,
          createdAt: img.createdAt,
        })),
      response: review.response
        ? {
            id: review.response.id,
            content: review.response.content,
            responder: {
              id: review.response.responder.id,
              name: review.response.responder.name,
              role: review.response.responder.role,
            },
            createdAt: review.response.createdAt,
            updatedAt: review.response.updatedAt,
          }
        : null,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  /**
   * Transform a list of reviews to response format with pagination
   */
  static fromReviewList(
    reviews: ReviewWithRelations[],
    page: number,
    limit: number,
    total: number
  ): ReviewListResponse {
    return {
      reviews: reviews.map((review) => this.fromReview(review)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
