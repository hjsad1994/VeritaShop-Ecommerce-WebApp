import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/WishlistService';
import { WishlistDto } from '../dtos/WishlistDto';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  /**
   * Get user's wishlist
   * GET /api/wishlist
   */
  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const wishlist = await this.wishlistService.getWishlist(userId);

      const wishlistDto = new WishlistDto(wishlist);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_WISHLIST_SUCCESS,
        data: wishlistDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add product to wishlist
   * POST /api/wishlist/items
   */
  addWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { productId } = req.body;

      const wishlist = await this.wishlistService.addWishlistItem(
        userId,
        productId
      );

      const wishlistDto = new WishlistDto(wishlist);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.WISHLIST_ITEM_ADDED,
        data: wishlistDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove item from wishlist
   * DELETE /api/wishlist/items/:id
   */
  removeWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id: itemId } = req.params;

      const wishlist = await this.wishlistService.removeWishlistItem(userId, itemId);

      const wishlistDto = new WishlistDto(wishlist);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.WISHLIST_ITEM_REMOVED,
        data: wishlistDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear all items from wishlist
   * DELETE /api/wishlist
   */
  clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const wishlist = await this.wishlistService.clearWishlist(userId);

      const wishlistDto = new WishlistDto(wishlist);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.WISHLIST_CLEARED,
        data: wishlistDto,
      });
    } catch (error) {
      next(error);
    }
  };
}
