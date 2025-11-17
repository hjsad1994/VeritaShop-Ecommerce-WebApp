import { Router } from 'express';
import { WishlistController } from '../controllers/WishlistController';
import { authenticate } from '../middleware';
import { validate } from '../middleware/validate';
import {
  addWishlistItemValidation,
  removeWishlistItemValidation,
} from '../validations/WishlistValidation';

export const createWishlistRoutes = (): Router => {
  const router = Router();
  const wishlistController = new WishlistController();

  /**
   * @route   GET /api/wishlist
   * @desc    Get user's wishlist
   * @access  Private
   */
  router.get('/', authenticate, wishlistController.getWishlist);

  /**
   * @route   POST /api/wishlist/items
   * @desc    Add product to wishlist
   * @access  Private
   */
  router.post(
    '/items',
    authenticate,
    validate(addWishlistItemValidation),
    wishlistController.addWishlistItem
  );

  /**
   * @route   DELETE /api/wishlist/items/:id
   * @desc    Remove item from wishlist
   * @access  Private
   */
  router.delete(
    '/items/:id',
    authenticate,
    validate(removeWishlistItemValidation),
    wishlistController.removeWishlistItem
  );

  /**
   * @route   DELETE /api/wishlist
   * @desc    Clear all items from wishlist
   * @access  Private
   */
  router.delete('/', authenticate, wishlistController.clearWishlist);

  return router;
};
