'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cartService, Cart as ApiCart, CartItem as ApiCartItem } from '@/lib/api/cartService';
import { authService, userService } from '@/lib/api';
import type { User } from '@/lib/api';

// Legacy types for backward compatibility during transition
export interface LegacyCartItem {
  product: any;
  quantity: number;
  selectedColor: string;
}

interface CartContextType {
  items: ApiCartItem[];
  isLoading: boolean;
  addToCart: (variantId: string, quantity: number, variantData?: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // Legacy support
  addToCartLegacy: (product: any, quantity: number, selectedColor: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart on mount and check authentication
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Check if user is authenticated
        const userResponse = await userService.getCurrentUser().catch(() => null);
        if (userResponse?.success) {
          setUser(userResponse.data.user);

          // If user is authenticated, merge guest cart
          await cartService.mergeGuestCartWithUserCart();
        }

        // Load cart data
        await refreshCart();
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeCart();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = async () => {
      try {
        const userResponse = await userService.getCurrentUser().catch(() => null);
        const newUser = userResponse?.success ? userResponse.data.user : null;

        if (newUser !== user) {
          setUser(newUser);

          if (newUser && user === null) {
            // User just logged in, merge guest cart
            await cartService.mergeGuestCartWithUserCart();
            await refreshCart();
          } else if (!newUser && user !== null) {
            // User just logged out, refresh to get guest cart
            await refreshCart();
          }
        }
      } catch (error) {
        console.error('Auth change error:', error);
      }
    };

    // Set up periodic auth check (simple approach)
    const interval = setInterval(handleAuthChange, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setItems(response.data.items);
      }
    } catch (error: any) {
      console.error('Failed to refresh cart:', error);
      toast.error(error.response?.data?.message || 'Không thể tải giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (variantId: string, quantity: number, variantData?: any) => {
    try {
      const response = await cartService.addCartItem(variantId, quantity);

      if (response.success) {
        setItems(response.data.items);
        toast.success('Đã thêm vào giỏ hàng');

        // Update guest cart variant data if provided
        if (variantData && !user) {
          cartService.updateGuestCartItemVariant(variantId, variantData);
        }
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  }, [user]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const response = await cartService.removeCartItem(itemId);

      if (response.success) {
        setItems(response.data.items);
        toast.success('Đã xóa khỏi giỏ hàng');
      }
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa khỏi giỏ hàng');
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const response = await cartService.updateCartItem(itemId, quantity);

      if (response.success) {
        setItems(response.data.items);
        toast.success('Đã cập nhật giỏ hàng');
      }
    } catch (error: any) {
      console.error('Failed to update cart quantity:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật giỏ hàng');
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartService.clearCart();

      if (response.success) {
        setItems(response.data.items);
        toast.success('Đã xóa giỏ hàng');
      }
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.itemSubtotal, 0);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Legacy support for existing components
  const addToCartLegacy = useCallback((product: any, quantity: number, selectedColor: string) => {
    // For legacy support, we'll create a temporary variant object
    // In real implementation, this should be updated to use variantId
    const tempVariantId = `${product.id}-${selectedColor}`;

    // Create temporary variant data
    const tempVariantData = {
      id: tempVariantId,
      productId: product.id,
      color: selectedColor,
      storage: null,
      price: product.price,
      isActive: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug || '',
        basePrice: product.price,
        images: product.images?.map((img: any, index: number) => ({
          id: `img-${index}`,
          url: img,
          sortOrder: index
        })) || []
      }
    };

    // Add to cart using new method
    addToCart(tempVariantId, quantity, tempVariantData);

    // Also save to legacy localStorage for backward compatibility
    const legacyCartKey = 'veritas-cart';
    try {
      const existingCart = JSON.parse(localStorage.getItem(legacyCartKey) || '[]');
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.product.id === product.id && item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        existingCart.push({ product, quantity, selectedColor });
      }

      localStorage.setItem(legacyCartKey, JSON.stringify(existingCart));
    } catch (error) {
      console.error('Failed to update legacy cart:', error);
    }
  }, [addToCart]);

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <CartContext.Provider value={{
        items: [],
        isLoading: true,
        addToCart: async () => {},
        removeFromCart: async () => {},
        updateQuantity: async () => {},
        clearCart: async () => {},
        refreshCart: async () => {},
        getTotalItems: () => 0,
        getTotalPrice: () => 0,
        isCartOpen: false,
        openCart,
        closeCart,
        addToCartLegacy: () => {},
      }}>
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        openCart,
        closeCart,
        addToCartLegacy,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}