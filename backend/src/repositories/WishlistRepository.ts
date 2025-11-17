import { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface WishlistWithItems {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<any>;
}

export class WishlistRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find wishlist by user ID with full relations
   */
  async findByUserId(userId: string): Promise<WishlistWithItems | null> {
    return await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                discount: true,
                isFeatured: true,
                averageRating: true,
                reviewCount: true,
                images: {
                  select: {
                    id: true,
                    url: true,
                    altText: true,
                    sortOrder: true,
                  },
                  where: {
                    variantId: null, // Only get main product images
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                  take: 1, // Get primary image only
                },
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // Newest items first
          },
        },
      },
    });
  }

  /**
   * Create a new wishlist for user
   */
  async createWishlist(userId: string) {
    return await this.prisma.wishlist.create({
      data: {
        userId,
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Get or create wishlist for user
   */
  async getOrCreateWishlist(userId: string): Promise<WishlistWithItems> {
    let wishlist = await this.findByUserId(userId);

    if (!wishlist) {
      await this.createWishlist(userId);
      wishlist = await this.findByUserId(userId);
    }

    return wishlist!;
  }

  /**
   * Find wishlist item by ID
   */
  async findWishlistItemById(itemId: string) {
    return await this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        wishlist: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Find wishlist item by wishlist ID and product ID
   */
  async findWishlistItemByProduct(wishlistId: string, productId: string) {
    return await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId,
          productId,
        },
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Add item to wishlist
   * @throws Error if product already exists in wishlist
   */
  async addWishlistItem(wishlistId: string, productId: string) {
    // Check if item already exists
    const existingItem = await this.findWishlistItemByProduct(wishlistId, productId);

    if (existingItem) {
      throw new Error('Product already in wishlist');
    }

    // Create new wishlist item
    return await this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            discount: true,
            images: {
              select: {
                id: true,
                url: true,
                altText: true,
                sortOrder: true,
              },
              where: {
                variantId: null,
              },
              orderBy: {
                sortOrder: 'asc',
              },
              take: 1,
            },
          },
        },
      },
    });
  }

  /**
   * Remove wishlist item
   */
  async removeWishlistItem(itemId: string) {
    return await this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Clear all items from wishlist
   */
  async clearWishlist(wishlistId: string) {
    return await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId },
    });
  }

  /**
   * Count total items in wishlist
   */
  countWishlistItems(wishlist: WishlistWithItems): number {
    return wishlist.items.length;
  }

  /**
   * Check if product is in user's wishlist
   */
  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.findByUserId(userId);

    if (!wishlist) {
      return false;
    }

    const item = await this.findWishlistItemByProduct(wishlist.id, productId);
    return !!item;
  }
}
