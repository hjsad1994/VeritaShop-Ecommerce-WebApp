'use client';

import React from 'react';
import { getProductById, type Review } from '@/lib/data/products';

interface ProductDetailProps {
  productId: string;
}

const colorMap: { [key: string]: string } = {
  'Black': '#000000',
  'Black Titanium': '#1a1a1a',
  'White': '#ffffff',
  'White Titanium': '#e5e5e5',
  'Blue': '#4169e1',
  'Blue Titanium': '#4a5f7f',
  'Natural': '#d4c5b0',
  'Natural Titanium': '#d4c5b0',
  'Red': '#dc2626',
  'Purple': '#9333ea',
  'Green': '#16a34a',
  'Silver': '#c0c0c0',
  'Gray': '#6b7280',
  'Gold': '#fbbf24',
  'Pink': '#ec4899',
  'Yellow': '#fde047',
};

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewText, setReviewText] = React.useState('');

  const productData = getProductById(parseInt(productId));

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <a href="/shop" className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  const { product: baseProduct, reviews } = productData;

  const product = {
    ...baseProduct,
    rating: baseProduct.rating || 4.5,
    totalReviews: baseProduct.totalReviews || 0,
    images: baseProduct.images || [baseProduct.image, baseProduct.image, baseProduct.image],
    description: baseProduct.description || 'High-quality smartphone with advanced features and excellent performance.',
    specs: baseProduct.specs || [
      { label: 'Display', value: '6.5" AMOLED' },
      { label: 'Processor', value: 'High Performance Chip' },
      { label: 'Camera', value: 'Advanced Camera System' },
      { label: 'Battery', value: '4000+ mAh' },
      { label: 'Storage', value: 'Multiple Options' },
      { label: 'OS', value: 'Latest OS' },
    ],
    stockCount: 12,
  };

  const oldReviews: Review[] = [
    {
      id: 1,
      userName: 'John Smith',
      rating: 5,
      date: '2025-10-15',
      comment: 'Amazing phone! The camera quality is outstanding and the performance is buttery smooth. Battery life easily gets me through a full day of heavy use.',
      verified: true,
    },
    {
      id: 2,
      userName: 'Sarah Johnson',
      rating: 5,
      date: '2025-10-10',
      comment: 'Best iPhone yet! The titanium build feels premium and the Dynamic Island is actually quite useful. Love the new USB-C port!',
      verified: true,
    },
    {
      id: 3,
      userName: 'Mike Chen',
      rating: 4,
      date: '2025-10-05',
      comment: 'Great phone overall, but quite expensive. The camera system is phenomenal for photography. Only complaint is the weight - it\'s noticeably heavier than my previous phone.',
      verified: true,
    },
    {
      id: 4,
      userName: 'Emily Davis',
      rating: 5,
      date: '2025-09-28',
      comment: 'Upgraded from iPhone 12 and the difference is night and day! ProMotion display is so smooth, and the battery life improvement is incredible.',
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-black hover:text-gray-700 transition-all">
                VeritaShop
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-black hover:text-gray-600 transition-all font-medium">Home</a>
              <a href="/shop" className="text-black hover:text-gray-600 transition-all font-medium">Shop</a>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <a href="#" className="text-black hover:text-gray-600 transition-all font-medium flex items-center gap-1">
                  Category
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
                  <div className="py-2">
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      iPhone
                    </a>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      Samsung
                    </a>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      Gaming Phones
                    </a>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      Huawei
                    </a>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      Xiaomi
                    </a>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      OnePlus
                    </a>
                    <div className="border-t border-gray-200 my-2"></div>
                    <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100 transition-all text-sm">
                      All Categories
                    </a>
                  </div>
                </div>
              </div>
              
              <a href="#" className="text-black hover:text-gray-600 transition-all font-medium">About</a>
              <a href="#" className="text-black hover:text-gray-600 transition-all font-medium">Blog</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-black hover:text-gray-600 transition-all font-medium">Login</button>
              <button className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cart (0)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Free Shipping Banner */}
      <div className="bg-black text-white py-3 text-center text-sm font-medium mt-16">
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-gray-600 hover:text-black font-medium">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <a href="/shop" className="text-gray-600 hover:text-black font-medium">Shop</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-black font-semibold">{product.name}</span>
        </div>
        
        <div className="px-4 sm:px-6 lg:px-8">

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              <h1 className="text-2xl font-bold text-black mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.totalReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-black">${product.price}</span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">${product.oldPrice}</span>
                )}
              </div>

              {/* Stock Status */}
              {product.inStock ? (
                <p className="text-green-600 font-medium text-sm mb-4">
                  ✓ In Stock ({product.stockCount} available)
                </p>
              ) : (
                <p className="text-red-600 font-medium text-sm mb-4">✗ Out of Stock</p>
              )}
            </div>

            {/* Color Selection */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="font-semibold text-black mb-2 text-sm">Color: {product.colors[selectedColor]}</h3>
              <div className="flex gap-2">
                {product.colors.map((color: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === idx ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: colorMap[color] || '#gray' }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <h3 className="font-semibold text-black mb-2 text-sm">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center border-2 border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-gray-100 transition-all text-base font-bold text-gray-700 hover:text-black"
                  >
                    −
                  </button>
                  <span className="px-4 py-1.5 font-bold text-lg text-black bg-gray-50 min-w-[50px] text-center border-x-2 border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-gray-100 transition-all text-base font-bold text-gray-700 hover:text-black"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-2 mb-6">
              <button className="flex-1 bg-black text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-gray-800 transition-all">
                Add to Cart
              </button>
              <button className="px-3 py-2.5 border-2 border-black rounded-md hover:bg-black hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Description */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="font-semibold text-black mb-2 text-sm">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="font-semibold text-black mb-2 text-sm">Specifications</h3>
              <div className="space-y-2">
                {product.specs.map((spec: { label: string; value: string }, idx: number) => (
                  <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">{spec.label}</span>
                    <span className="text-black font-medium text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold text-black">{product.rating}</span>
                <div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Based on {product.totalReviews} reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="mb-12 p-6 bg-gray-50 rounded-lg max-w-2xl">
            <h3 className="font-semibold text-black mb-4">Rating Breakdown</h3>
            {[5, 4, 3, 2, 1].map(star => {
              const percentage = star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 3 : star === 2 ? 1 : 1;
              return (
                <div key={star} className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-600 w-12">{star} stars</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                </div>
              );
            })}
          </div>

          {/* Write Review Button */}
          <div className="mb-8">
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {(reviews.length > 0 ? reviews : oldReviews).map(review => (
              <div key={review.id} className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-black">{review.userName}</h4>
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                {/* Review Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <button className="text-sm text-gray-600 hover:text-black transition-all flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Helpful (24)
                  </button>
                  <button className="text-sm text-gray-600 hover:text-black transition-all">
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Reviews */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all">
              Load More Reviews
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Write a Review</h2>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-gray-400 hover:text-black transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold text-black">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
              </div>

              {/* Rating Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="transition-all hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Excellent"}
                </p>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-3">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none resize-none"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">{reviewText.length} / 500 characters</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-black rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would submit the review
                    alert(`Review submitted!\nRating: ${reviewRating} stars\nReview: ${reviewText}`);
                    setIsReviewModalOpen(false);
                    setReviewText('');
                    setReviewRating(5);
                  }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
