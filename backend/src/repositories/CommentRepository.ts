import { Comment, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { ERROR_MESSAGES } from '../constants';

export interface CreateCommentData {
  productId: string;
  userId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentQueryOptions {
  productId?: string;
  userId?: string;
  parentId?: string | null; // null for root comments only
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest';
}

export class CommentRepository extends BaseRepository<Comment> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find all comments with filtering, pagination and sorting
   */
  async findAll(
    options: CommentQueryOptions
  ): Promise<{ comments: Comment[]; total: number }> {
    const {
      productId,
      userId,
      parentId,
      page = 1,
      limit = 20,
      sortBy = 'newest',
    } = options;

    // Build where clause
    const where: Prisma.CommentWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    // Handle parentId: undefined = all comments, null = root only, string = specific parent
    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    // Build orderBy clause
    let orderBy: Prisma.CommentOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          parent: {
            select: {
              id: true,
              userId: true,
              content: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return { comments, total };
  }

  /**
   * Find comment by ID with basic relations
   */
  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
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
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Find comment by ID with nested replies (deep structure)
   */
  async findByIdWithReplies(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
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
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new comment
   */
  async create(data: CreateCommentData): Promise<Comment> {
    // Validate parent exists if parentId is provided
    if (data.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error(ERROR_MESSAGES.COMMENT_PARENT_NOT_FOUND);
      }
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        content: data.content,
        parentId: data.parentId || null,
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
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
        replies: true,
      },
    });

    return comment;
  }

  /**
   * Update comment content
   */
  async update(id: string, data: UpdateCommentData): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date(),
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
        parent: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Delete comment (cascade deletes replies automatically via Prisma schema)
   */
  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
