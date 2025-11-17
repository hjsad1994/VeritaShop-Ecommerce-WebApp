import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/CartService';
import { CartDto } from '../dtos/CartDto';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Get user's cart
   * GET /api/cart
   */
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const cart = await this.cartService.getCart(userId);

      const cartDto = new CartDto(cart);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_CART_SUCCESS,
        data: cartDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  addCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { variantId, quantity } = req.body;

      const cart = await this.cartService.addCartItem(
        userId,
        variantId,
        quantity
      );

      const cartDto = new CartDto(cart);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_ITEM_ADDED,
        data: cartDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update cart item quantity
   * PUT /api/cart/items/:id
   */
  updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id: itemId } = req.params;
      const { quantity } = req.body;

      const cart = await this.cartService.updateCartItem(
        userId,
        itemId,
        quantity
      );

      const cartDto = new CartDto(cart);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_ITEM_UPDATED,
        data: cartDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id: itemId } = req.params;

      const cart = await this.cartService.removeCartItem(userId, itemId);

      const cartDto = new CartDto(cart);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_ITEM_REMOVED,
        data: cartDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const cart = await this.cartService.clearCart(userId);

      const cartDto = new CartDto(cart);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CART_CLEARED,
        data: cartDto,
      });
    } catch (error) {
      next(error);
    }
  };
}
