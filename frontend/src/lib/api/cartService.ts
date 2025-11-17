import { apiClient } from './apiClient';
import { ApiResponse } from './types';

// Cart Types
export interface CartProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: CartProductImage[];
}

export interface CartVariant {
  id: string;
  productId: string;
  color: string;
  storage: string | null;
  price: number;
  isActive: boolean;
  product: CartProduct;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariant;
  itemSubtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string | null;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AddCartItemRequest {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Local Storage Types for Guest Users
export interface GuestCartItem {
  id: string; // variantId
  variantId: string;
  quantity: number;
  variant: CartVariant;
  itemSubtotal: number;
  addedAt: Date;
}

export interface GuestCart {
  items: GuestCartItem[];
  subtotal: number;
  totalItems: number;
}

class CartService {
  private baseUrl = '/cart';
  private guestCartKey = 'veritas-guest-cart';

  // Backend Cart Methods (for authenticated users)
  async getCart(): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      // If user is not authenticated, fallback to guest cart
      if (error.response?.status === 401) {
        const guestCart = this.getGuestCart();
        return {
          success: true,
          message: 'Lấy giỏ hàng khách thành công',
          data: this.convertGuestCartToCart(guestCart)
        };
      }
      throw error;
    }
  }

  async addCartItem(variantId: string, quantity: number): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/items`, { variantId, quantity });
      return response.data;
    } catch (error: any) {
      // If user is not authenticated, add to guest cart
      if (error.response?.status === 401) {
        const guestCart = this.addToGuestCart(variantId, quantity);
        return {
          success: true,
          message: 'Thêm vào giỏ hàng khách thành công',
          data: this.convertGuestCartToCart(guestCart)
        };
      }
      throw error;
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/items/${itemId}`, { quantity });
      return response.data;
    } catch (error: any) {
      // If user is not authenticated, update guest cart
      if (error.response?.status === 401) {
        const guestCart = this.updateGuestCartItem(itemId, quantity);
        return {
          success: true,
          message: 'Cập nhật giỏ hàng khách thành công',
          data: this.convertGuestCartToCart(guestCart)
        };
      }
      throw error;
    }
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/items/${itemId}`);
      return response.data;
    } catch (error: any) {
      // If user is not authenticated, remove from guest cart
      if (error.response?.status === 401) {
        const guestCart = this.removeFromGuestCart(itemId);
        return {
          success: true,
          message: 'Xóa khỏi giỏ hàng khách thành công',
          data: this.convertGuestCartToCart(guestCart)
        };
      }
      throw error;
    }
  }

  async clearCart(): Promise<ApiResponse<Cart>> {
    try {
      const response = await apiClient.delete(this.baseUrl);
      return response.data;
    } catch (error: any) {
      // If user is not authenticated, clear guest cart
      if (error.response?.status === 401) {
        this.clearGuestCart();
        return {
          success: true,
          message: 'Xóa giỏ hàng khách thành công',
          data: this.convertGuestCartToCart({ items: [], subtotal: 0, totalItems: 0 })
        };
      }
      throw error;
    }
  }

  // Guest Cart Methods (localStorage)
  private getGuestCart(): GuestCart {
    if (typeof window === 'undefined') {
      return { items: [], subtotal: 0, totalItems: 0 };
    }

    try {
      const cartData = localStorage.getItem(this.guestCartKey);
      if (!cartData) {
        return { items: [], subtotal: 0, totalItems: 0 };
      }

      const guestCart = JSON.parse(cartData);
      return {
        items: guestCart.items || [],
        subtotal: guestCart.subtotal || 0,
        totalItems: guestCart.totalItems || 0
      };
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return { items: [], subtotal: 0, totalItems: 0 };
    }
  }

  private saveGuestCart(guestCart: GuestCart): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.guestCartKey, JSON.stringify(guestCart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }

  private addToGuestCart(variantId: string, quantity: number): GuestCart {
    const guestCart = this.getGuestCart();

    // We need variant details - for now, create a minimal variant object
    // In real implementation, we should fetch variant details first
    const existingItemIndex = guestCart.items.findIndex(item => item.variantId === variantId);

    if (existingItemIndex !== -1) {
      // Update existing item
      guestCart.items[existingItemIndex].quantity += quantity;
      guestCart.items[existingItemIndex].itemSubtotal =
        guestCart.items[existingItemIndex].variant.price * guestCart.items[existingItemIndex].quantity;
    } else {
      // Add new item - create placeholder variant
      const newItem: GuestCartItem = {
        id: variantId,
        variantId,
        quantity,
        variant: {
          id: variantId,
          productId: '',
          color: '',
          storage: null,
          price: 0,
          isActive: true,
          product: {
            id: '',
            name: 'Loading...',
            slug: '',
            basePrice: 0,
            images: []
          }
        },
        itemSubtotal: 0,
        addedAt: new Date()
      };
      guestCart.items.push(newItem);
    }

    // Recalculate totals
    guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
    guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.saveGuestCart(guestCart);
    return guestCart;
  }

  private updateGuestCart(itemId: string, quantity: number): GuestCart {
    const guestCart = this.getGuestCart();
    const itemIndex = guestCart.items.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        guestCart.items.splice(itemIndex, 1);
      } else {
        guestCart.items[itemIndex].quantity = quantity;
        guestCart.items[itemIndex].itemSubtotal =
          guestCart.items[itemIndex].variant.price * quantity;
      }
    }

    // Recalculate totals
    guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
    guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.saveGuestCart(guestCart);
    return guestCart;
  }

  private removeFromGuestCart(itemId: string): GuestCart {
    const guestCart = this.getGuestCart();
    guestCart.items = guestCart.items.filter(item => item.id !== itemId);

    // Recalculate totals
    guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
    guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.saveGuestCart(guestCart);
    return guestCart;
  }

  private clearGuestCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.guestCartKey);
  }

  private convertGuestCartToCart(guestCart: GuestCart): Cart {
    return {
      id: null,
      userId: 'guest',
      items: guestCart.items.map(item => ({
        ...item,
        cartId: 'guest-cart',
        createdAt: item.addedAt,
        updatedAt: new Date()
      })),
      subtotal: guestCart.subtotal,
      totalItems: guestCart.totalItems,
      createdAt: null,
      updatedAt: null
    };
  }

  // Utility Methods
  async mergeGuestCartWithUserCart(): Promise<ApiResponse<Cart>> {
    const guestCart = this.getGuestCart();

    if (guestCart.items.length === 0) {
      return this.getCart();
    }

    try {
      // Add each guest cart item to user cart
      for (const item of guestCart.items) {
        try {
          await this.addCartItem(item.variantId, item.quantity);
        } catch (error) {
          console.error('Failed to merge cart item:', error);
          // Continue with other items even if one fails
        }
      }

      // Clear guest cart after successful merge
      this.clearGuestCart();

      // Return updated user cart
      return this.getCart();
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
      throw error;
    }
  }

  // Method to update guest cart item variant details (when product data is loaded)
  updateGuestCartItemVariant(variantId: string, variantData: CartVariant): void {
    const guestCart = this.getGuestCart();
    const itemIndex = guestCart.items.findIndex(item => item.variantId === variantId);

    if (itemIndex !== -1) {
      guestCart.items[itemIndex].variant = variantData;
      guestCart.items[itemIndex].itemSubtotal = variantData.price * guestCart.items[itemIndex].quantity;

      // Recalculate totals
      guestCart.subtotal = guestCart.items.reduce((sum, item) => sum + item.itemSubtotal, 0);
      guestCart.totalItems = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);

      this.saveGuestCart(guestCart);
    }
  }

  // Check if cart is empty
  isEmpty(): Promise<boolean> {
    return this.getCart().then(cart => cart.items.length === 0);
  }

  // Get total items count
  getTotalItems(): Promise<number> {
    return this.getCart().then(cart => cart.totalItems);
  }

  // Get subtotal
  getSubtotal(): Promise<number> {
    return this.getCart().then(cart => cart.subtotal);
  }
}

export const cartService = new CartService();