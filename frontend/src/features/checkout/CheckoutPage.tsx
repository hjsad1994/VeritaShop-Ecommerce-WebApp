'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: 'card' | 'paypal' | 'cod';
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Vietnam',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber?.trim()) newErrors.cardNumber = 'Card number is required';
      if (!formData.cardExpiry?.trim()) newErrors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCVV?.trim()) newErrors.cardCVV = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save order to localStorage
    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: items,
      customerInfo: {
        ...formData,
        zipCode: formData.city // Use city as zipCode for now
      },
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
    };

    const orders = JSON.parse(localStorage.getItem('veritas-orders') || '[]');
    orders.push(order);
    localStorage.setItem('veritas-orders', JSON.stringify(orders));

    clearCart();
    router.push(`/order-confirmation?orderId=${order.id}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header theme="light" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
          <div className="text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-black mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products before checking out</p>
            <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white py-3 text-center text-sm font-medium mt-16 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold tracking-wide">SECURE CHECKOUT - SSL ENCRYPTED</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <span>/</span>
            <span className="text-black font-medium">Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Checkout</h1>
            <p className="text-sm text-gray-600">Complete your secure order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black p-3 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-600">Your personal details for order processing</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>First Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.firstName
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Last Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.lastName
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Email Address</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.email
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.phone
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="+84 123 456 789"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black p-3 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                  <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Street Address</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.address ? 'border-gray-800 bg-gray-100' : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <span>City</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.city
                        ? 'border-gray-800 bg-gray-100'
                        : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                        }`}
                      placeholder="Ho Chi Minh"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <span>Country</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200 text-black"
                    >
                      <option value="Vietnam">Vietnam</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Thailand">Thailand</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black p-3 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">Choose your preferred payment option</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'cod' ? '#10b981' : '#d1d5db',
                    backgroundColor: formData.paymentMethod === 'cod' ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-black">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                  {formData.paymentMethod === 'cod' && (
                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">Selected</span>
                  )}
                </label>

                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'card' ? '#3b82f6' : '#d1d5db',
                    backgroundColor: formData.paymentMethod === 'card' ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-black">Credit / Debit Card</div>
                    <div className="text-sm text-gray-600">Pay securely with your card</div>
                  </div>
                  {formData.paymentMethod === 'card' && (
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Selected</span>
                  )}
                </label>

                {formData.paymentMethod === 'card' && (
                  <div className="ml-8 space-y-4 pt-4 border-t-2 border-gray-300 bg-gray-50 -mx-4 px-4 pb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition text-black placeholder:text-gray-400 ${errors.cardNumber ? 'border-gray-800 bg-gray-100' : 'border-gray-300 focus:border-black'
                          }`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry || ''}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition text-black placeholder:text-gray-400 ${errors.cardExpiry ? 'border-gray-800 bg-gray-100' : 'border-gray-300 focus:border-black'
                            }`}
                          placeholder="MM/YY"
                        />
                        {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          name="cardCVV"
                          value={formData.cardCVV || ''}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition text-black placeholder:text-gray-400 ${errors.cardCVV ? 'border-gray-800 bg-gray-100' : 'border-gray-300 focus:border-black'
                          }`}
                          placeholder="123"
                        />
                        {errors.cardCVV && <p className="text-red-500 text-xs mt-1">{errors.cardCVV}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24 shadow-md border-2 border-gray-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-300">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-black">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedColor}-${index}`} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border-2 border-gray-200">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate">{item.product.name}</h3>
                      <p className="text-xs text-gray-600">{item.selectedColor} • Qty: {item.quantity}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold text-black">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-black font-semibold">FREE</span>
                    ) : (
                      <span className="text-black">${shipping.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold text-black">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-black">Total</span>
                  <span className="text-xl font-bold text-black">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg ${isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Complete Order
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-3 text-xs">
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-bold text-blue-600">VISA</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-bold text-orange-600">MasterCard</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-bold text-blue-700">PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
