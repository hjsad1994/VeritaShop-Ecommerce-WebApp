import { WishlistRepository } from '../repositories/WishlistRepository';
import { RepositoryFactory } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class WishlistService {
  private wishlistRepository: WishlistRepository;
  private productRepository: any;

  constructor() {
    this.wishlistRepository = RepositoryFactory.getWishlistRepository();
    this.productRepository = RepositoryFactory.getProductRepository();
  }

  /**
   * Get user's wishlist with all items
   */
  async getWishlist(userId: string) {
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId);

    if (!wishlist || wishlist.items.length === 0) {
      // Return empty wishlist structure
      return {
        id: wishlist?.id || null,
        userId,
        items: [],
        totalItems: 0,
        createdAt: wishlist?.createdAt || null,
        updatedAt: wishlist?.updatedAt || null,
      };
    }

    const totalItems = this.wishlistRepository.countWishlistItems(wishlist);

    return {
      ...wishlist,
      totalItems,
    };
  }

  /**
   * Add product to wishlist
   */
  async addWishlistItem(userId: string, productId: string) {
    // Validate product exists and is active
    const product = await this.productRepository.findById(productId);

    if (!product || !product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    // Get or create wishlist
    const wishlist = await this.wishlistRepository.getOrCreateWishlist(userId);

    // Check if product already in wishlist
    const existingItem = await this.wishlistRepository.findWishlistItemByProduct(
      wishlist.id,
      productId
    );

    if (existingItem) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        ERROR_MESSAGES.WISHLIST_ITEM_ALREADY_EXISTS
      );
    }

    // Add item to wishlist
    await this.wishlistRepository.addWishlistItem(wishlist.id, productId);

    // Return updated wishlist
    return await this.getWishlist(userId);
  }

  /**
   * Remove item from wishlist
   */
  async removeWishlistItem(userId: string, itemId: string) {
    // Get wishlist item
    const wishlistItem = await this.wishlistRepository.findWishlistItemById(itemId);

    if (!wishlistItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.WISHLIST_ITEM_NOT_FOUND);
    }

    // Verify wishlist ownership
    if (wishlistItem.wishlist.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    // Remove item
    await this.wishlistRepository.removeWishlistItem(itemId);

    // Return updated wishlist
    return await this.getWishlist(userId);
  }

  /**
   * Clear all items from wishlist
   */
  async clearWishlist(userId: string) {
    // Get wishlist
    const wishlist = await this.wishlistRepository.findByUserId(userId);

    if (!wishlist) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.WISHLIST_NOT_FOUND);
    }

    // Clear all items
    await this.wishlistRepository.clearWishlist(wishlist.id);

    // Return empty wishlist
    return {
      id: wishlist.id,
      userId,
      items: [],
      totalItems: 0,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  /**
   * Check if product is in user's wishlist
   */
  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    return await this.wishlistRepository.isProductInWishlist(userId, productId);
  }
}
