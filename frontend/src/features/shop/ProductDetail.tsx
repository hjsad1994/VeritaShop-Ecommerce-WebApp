'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Toast from '@/components/ui/Toast';
import productService from '@/lib/api/productService';
import { ProductDetail as ProductDetailType, ProductVariantItem, ProductImage } from '@/lib/api/types';
import CommentSection from './components/comments/CommentSection';

interface ProductDetailProps {
  productSlug: string;
}

export default function ProductDetail({ productSlug }: ProductDetailProps) {
  const { addToCartLegacy, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // const [reviewRating, setReviewRating] = useState(5);
  // const [reviewText, setReviewText] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductBySlug(productSlug);
      setProduct(data);
      
      // Select first active variant by default if available
      if (data.variants && data.variants.length > 0) {
        // Find first active variant or just first one
        const defaultVariant = data.variants.find(v => v.isActive !== false) || data.variants[0];
        setSelectedVariant(defaultVariant);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Product not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Get images to display: Variant images (max 5) + Product primary image?
  // Spec says: "displays 5 corresponding images... for that specific variant"
  // If no variant selected (or no variant images), fallback to product images?
  const displayImages = React.useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        return selectedVariant.images.map((img: ProductImage) => img.url).slice(0, 5);
    }
    if (product && product.images && product.images.length > 0) {
        return product.images.map((img: ProductImage) => img.url).slice(0, 5);
    }
    return [product?.primaryImage || '/placeholder.png'];
  }, [product, selectedVariant]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Product not found</h2>
          <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/shop" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Price display
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.finalPrice || product.basePrice);
  const oldPrice = selectedVariant && selectedVariant.comparePrice ? Number(selectedVariant.comparePrice) : (Number(product.basePrice) > Number(product.finalPrice) ? Number(product.basePrice) : null);

  // Inventory display
  const inventory = selectedVariant?.inventory;
  const maxQuantity = inventory ? inventory.available : 10; // Fallback if no inventory data
  const isOutOfStock = inventory ? inventory.available <= 0 : false;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', window.location.pathname);
      window.location.href = '/login';
      return;
    }
    
    if (!selectedVariant) {
        alert('Please select a variant');
        return;
    }

    setIsAddingToCart(true);

    const legacyProduct = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      slug: product.slug,
      images: displayImages
    };
    
    // Note: Legacy cart might need updating to handle variant ID properly
    // For now passing variant color as "color" option
    addToCartLegacy(legacyProduct, quantity, selectedVariant.color);

    setTimeout(() => {
      setIsAddingToCart(false);
      setShowToast(true);
      setTimeout(() => openCart(), 300);
    }, 500);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', '/checkout');
      window.location.href = '/login';
      return;
    }
    handleAddToCart();
    // Ideally redirect to checkout immediately, but we add to cart first
    setTimeout(() => {
        window.location.href = '/checkout';
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message="Product added to cart successfully!" 
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <Header theme="light" />

      <div className="bg-black text-white py-3 text-center text-sm font-medium mt-16">
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <span>/</span>
            <span className="text-black font-medium">{product.name}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div>
            <div className="bg-gray-50 rounded-2xl aspect-square mb-6 flex items-center justify-center overflow-hidden relative">
              <Image
                src={displayImages[selectedImageIndex] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-contain p-8"
                unoptimized
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="grid grid-cols-5 gap-4">
              {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                    selectedImageIndex === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-contain p-2 bg-gray-50"
                    unoptimized
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="text-4xl font-bold text-black mb-4">{product.name}</h1>
            
            {/* Rating (Placeholder for now as API might not return full reviews yet or format differs) */}
            <div className="flex items-center gap-4 mb-6">
               <div className="flex items-center gap-2">
                 <span className="text-yellow-400">★</span>
                 <span className="text-sm text-gray-600">{product.averageRating || '0.0'} ({product.reviewCount || 0} reviews)</span>
               </div>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-bold text-black">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
              </span>
              {oldPrice && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldPrice)}
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="prose prose-sm text-gray-700" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-black mb-3">Select Variant</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: ProductVariantItem) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg border-2 transition flex flex-col items-center ${
                      selectedVariant?.id === variant.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm font-bold text-black">{variant.color}</span>
                    {(variant.storage || variant.ram) && (
                        <span className="text-xs text-gray-600">
                            {variant.storage ? variant.storage : ''}
                            {variant.storage && variant.ram ? ' - ' : ''}
                            {variant.ram ? variant.ram : ''}
                        </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Quantity & Inventory */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-black mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2 hover:bg-gray-100 transition text-black disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-bold text-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={isOutOfStock || quantity >= maxQuantity}
                    className="px-4 py-2 hover:bg-gray-100 transition text-black disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {inventory ? (isOutOfStock ? 'Out of Stock' : `${inventory.available} available`) : 'In Stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                className={`flex-1 bg-white border-2 border-black text-black py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  isAddingToCart || isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:scale-[1.02]'
                }`}
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 bg-black text-white py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:scale-[1.02]'
                }`}
              >
                Buy Now
              </button>
            </div>
            
            {/* Specs Display */}
            {product.specs && (
                <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-bold mb-4">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(product.specs).map(([key, value]) => {
                            if (key === 'id' || key === 'productId' || key === 'createdAt' || key === 'updatedAt' || !value) return null;
                            // Format camelCase keys to Title Case if needed
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                                <div key={key} className="flex flex-col">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-medium text-black">{String(value)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>

      <CommentSection productId={product.id} />
      
      <Footer />
    </div>
  );
}
