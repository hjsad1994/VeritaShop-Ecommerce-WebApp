import { CartRepository } from '../repositories/CartRepository';
import { RepositoryFactory } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: any;

  constructor() {
    this.cartRepository = RepositoryFactory.getCartRepository();
    this.productRepository = RepositoryFactory.getProductRepository();
  }

  /**
   * Get user's cart with all items and calculations
   */
  async getCart(userId: string) {
    const cart = await this.cartRepository.getCartWithCalculations(userId);

    if (!cart) {
      // Return empty cart structure if user has no cart
      return {
        id: null,
        userId,
        items: [],
        subtotal: 0,
        totalItems: 0,
        createdAt: null,
        updatedAt: null,
      };
    }

    return cart;
  }

  /**
   * Add item to cart with stock validation
   */
  async addCartItem(userId: string, variantId: string, quantity: number) {
    // Validate variant exists and is active
    const variant = await this.productRepository.findVariantById(variantId);

    if (!variant || !variant.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VARIANT_NOT_FOUND);
    }

    // Validate product is active
    if (!variant.product || !variant.product.isActive) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    // Get or create cart
    const cart = await this.cartRepository.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.cartRepository.findCartItemByVariant(
      cart.id,
      variantId
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // Validate stock availability
    if (newQuantity > variant.stock) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `VARIANT_OUT_OF_STOCK: Chỉ còn ${variant.stock} sản phẩm trong kho`
      );
    }

    // Add or update cart item
    const cartItem = await this.cartRepository.addCartItem(
      cart.id,
      variantId,
      quantity
    );

    // Return updated cart with calculations
    return await this.cartRepository.getCartWithCalculations(userId);
  }

  /**
   * Update cart item quantity with stock validation
   */
  async updateCartItem(userId: string, itemId: string, quantity: number) {
    // Validate quantity
    if (quantity < 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY);
    }

    // Get cart item
    const cartItem = await this.cartRepository.findCartItemById(itemId);

    if (!cartItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.CART_ITEM_NOT_FOUND);
    }

    // Verify cart ownership
    if (cartItem.cart.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    // Validate stock availability
    if (quantity > cartItem.variant.stock) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `VARIANT_OUT_OF_STOCK: Chỉ còn ${cartItem.variant.stock} sản phẩm trong kho`
      );
    }

    // Update quantity
    await this.cartRepository.updateCartItemQuantity(itemId, quantity);

    // Return updated cart with calculations
    return await this.cartRepository.getCartWithCalculations(userId);
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(userId: string, itemId: string) {
    // Get cart item
    const cartItem = await this.cartRepository.findCartItemById(itemId);

    if (!cartItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.CART_ITEM_NOT_FOUND);
    }

    // Verify cart ownership
    if (cartItem.cart.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    // Remove item
    await this.cartRepository.removeCartItem(itemId);

    // Return updated cart with calculations
    return await this.cartRepository.getCartWithCalculations(userId);
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string) {
    // Get cart
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.CART_NOT_FOUND);
    }

    // Clear all items
    await this.cartRepository.clearCart(cart.id);

    // Return empty cart
    return {
      id: cart.id,
      userId,
      items: [],
      subtotal: 0,
      totalItems: 0,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Validate cart before checkout
   * Returns array of items with stock issues
   */
  async validateCartForCheckout(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.CART_EMPTY);
    }

    const stockIssues: Array<{
      itemId: string;
      productName: string;
      requestedQuantity: number;
      availableStock: number;
    }> = [];

    // Check stock for each item
    for (const item of cart.items) {
      if (item.quantity > item.variant.stock) {
        stockIssues.push({
          itemId: item.id,
          productName: item.variant.product.name,
          requestedQuantity: item.quantity,
          availableStock: item.variant.stock,
        });
      }

      // Check if variant is still active
      if (!item.variant.isActive) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Sản phẩm "${item.variant.product.name}" không còn khả dụng`
        );
      }
    }

    if (stockIssues.length > 0) {
      return {
        valid: false,
        issues: stockIssues,
      };
    }

    return {
      valid: true,
      cart,
    };
  }
}
