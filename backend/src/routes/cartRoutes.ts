import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authenticate } from '../middleware';
import { validate } from '../middleware/validate';
import {
  addCartItemValidation,
  updateCartItemValidation,
  removeCartItemValidation,
} from '../validations/CartValidation';

export const createCartRoutes = (): Router => {
  const router = Router();
  const cartController = new CartController();

  /**
   * @route   GET /api/cart
   * @desc    Get user's cart
   * @access  Private
   */
  router.get('/', authenticate, cartController.getCart);

  /**
   * @route   POST /api/cart/items
   * @desc    Add item to cart
   * @access  Private
   */
  router.post(
    '/items',
    authenticate,
    validate(addCartItemValidation),
    cartController.addCartItem
  );

  /**
   * @route   PUT /api/cart/items/:id
   * @desc    Update cart item quantity
   * @access  Private
   */
  router.put(
    '/items/:id',
    authenticate,
    validate(updateCartItemValidation),
    cartController.updateCartItem
  );

  /**
   * @route   DELETE /api/cart/items/:id
   * @desc    Remove item from cart
   * @access  Private
   */
  router.delete(
    '/items/:id',
    authenticate,
    validate(removeCartItemValidation),
    cartController.removeCartItem
  );

  /**
   * @route   DELETE /api/cart
   * @desc    Clear all items from cart
   * @access  Private
   */
  router.delete('/', authenticate, cartController.clearCart);

  return router;
};
