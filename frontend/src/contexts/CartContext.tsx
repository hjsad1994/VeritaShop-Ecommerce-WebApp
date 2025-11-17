'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor: string) => void;
  removeFromCart: (productId: number, selectedColor: string) => void;
  updateQuantity: (productId: number, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const addToCartRef = React.useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const savedCart = localStorage.getItem('veritas-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('veritas-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, selectedColor: string) => {
    const itemKey = `${product.id}-${selectedColor}`;
    
    // Check if we're already processing this exact item
    if (addToCartRef.current[itemKey]) {
      console.log('⚠️ Already processing this item, ignoring...');
      return;
    }

    // Mark this item as being processed
    addToCartRef.current[itemKey] = true;
    
    console.log('🛒 ADD TO CART:', { 
      productId: product.id, 
      productName: product.name, 
      quantity, 
      selectedColor,
      currentCartItems: items.length
    });

    // Use setTimeout to break the React sync execution cycle
    setTimeout(() => {
      setItems(prevItems => {
        console.log('🔄 Processing cart update...');
        
        // Check if this exact item already exists with same ID and color
        const existingItemIndex = prevItems.findIndex(
          item => item.product.id === product.id && item.selectedColor === selectedColor
        );

        let result;
        if (existingItemIndex > -1) {
          // Update existing item
          const newItems = [...prevItems];
          const oldQuantity = newItems[existingItemIndex].quantity;
          newItems[existingItemIndex].quantity += quantity;
          console.log('✅ UPDATED existing item:', {
            productId: product.id,
            oldQuantity,
            addedQuantity: quantity,
            newQuantity: newItems[existingItemIndex].quantity
          });
          result = newItems;
        } else {
          // Add new item
          console.log('✅ ADDED new item:', { productId: product.id, quantity, selectedColor });
          result = [...prevItems, { product, quantity, selectedColor }];
        }
        
        // Clear the processing flag after a delay
        setTimeout(() => {
          delete addToCartRef.current[itemKey];
          console.log('🔓 Cleared processing flag for:', itemKey);
        }, 300);
        
        return result;
      });
    }, 0);
  };

  const removeFromCart = (productId: number, selectedColor: string) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.product.id === productId && item.selectedColor === selectedColor)
      )
    );
  };

  const updateQuantity = (productId: number, selectedColor: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        openCart,
        closeCart,
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
