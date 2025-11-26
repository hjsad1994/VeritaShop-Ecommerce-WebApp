import { Comment, User, Product } from '@prisma/client';

// Response interface for single comment
export interface ICommentResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  content: string;
  parentId: string | null;
  replyCount: number;
  aiAnalysis?: any;
  replies?: ICommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// Response interface for comment list with pagination
export interface CommentListResponse {
  comments: ICommentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type for Comment with all relations
type CommentWithRelations = Comment & {
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  product: Pick<Product, 'id' | 'name' | 'slug'>;
  parent: Pick<Comment, 'id' | 'userId' | 'content'> | null;
  replies?: (Comment & {
    user: Pick<User, 'id' | 'name' | 'avatar'>;
    replies?: (Comment & {
      user: Pick<User, 'id' | 'name' | 'avatar'>;
    })[];
  })[];
};

/**
 * CommentDto - Data Transfer Object for Comment responses
 * Transforms database entities into clean API response structures
 */
export class CommentDto {
  /**
   * Transform single comment to response format (recursive for nested replies)
   */
  static fromComment(comment: CommentWithRelations): ICommentResponse {
    return {
      id: comment.id,
      productId: comment.productId,
      productName: comment.product.name,
      productSlug: comment.product.slug,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar: comment.user.avatar || null,
      },
      content: comment.content,
      parentId: comment.parentId,
      replyCount: comment.replies?.length || 0,
      aiAnalysis: (comment as any).aiAnalysis,
      replies: comment.replies
        ?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((reply) => ({
          id: reply.id,
          productId: comment.productId,
          productName: comment.product.name,
          productSlug: comment.product.slug,
          user: {
            id: reply.user.id,
            name: reply.user.name,
            avatar: reply.user.avatar || null,
          },
          content: reply.content,
          parentId: reply.parentId,
          replyCount: reply.replies?.length || 0,
          aiAnalysis: (reply as any).aiAnalysis,
          replies: reply.replies
            ?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((nestedReply) => ({
              id: nestedReply.id,
              productId: comment.productId,
              productName: comment.product.name,
              productSlug: comment.product.slug,
              user: {
                id: nestedReply.user.id,
                name: nestedReply.user.name,
                avatar: nestedReply.user.avatar || null,
              },
              content: nestedReply.content,
              parentId: nestedReply.parentId,
              replyCount: 0,
              aiAnalysis: (nestedReply as any).aiAnalysis,
              createdAt: nestedReply.createdAt,
              updatedAt: nestedReply.updatedAt,
            })),
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        })),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  /**
   * Transform comment list to response format with pagination
   */
  static fromCommentList(
    comments: CommentWithRelations[],
    page: number,
    limit: number,
    total: number
  ): CommentListResponse {
    return {
      comments: comments.map((comment) => this.fromComment(comment)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
