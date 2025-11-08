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
  zipCode: string;
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
    zipCode: '',
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
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';

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
      customerInfo: formData,
      subtotal,
      shipping,
      tax,
      total,
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Link href="/" className="hover:text-black transition">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition">Shop</Link>
            <span>/</span>
            <span className="text-black font-medium">Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-black to-gray-800 p-3 rounded-xl shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Checkout</h1>
            <p className="text-sm text-gray-600">Complete your secure order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Information */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-black">Contact Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="+84 123 456 789"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-black">Shipping Address</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                      errors.address ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-0.5">{errors.address}</p>}
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                        errors.city ? 'border-red-500' : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="Ho Chi Minh"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-0.5">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300 focus:border-black'
                      }`}
                      placeholder="700000"
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-0.5">{errors.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition"
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
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-black">Payment Method</h2>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] bg-gradient-to-r hover:from-gray-50 hover:to-white"
                  style={{
                    borderColor: formData.paymentMethod === 'cod' ? '#22c55e' : '#d1d5db',
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
                    <div className="font-bold text-sm text-black flex items-center gap-2">
                      Cash on Delivery
                      {formData.paymentMethod === 'cod' && (
                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Pay when you receive your order</div>
                  </div>
                  <div className={`p-2 rounded-lg ${formData.paymentMethod === 'cod' ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <svg className={`w-5 h-5 ${formData.paymentMethod === 'cod' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] bg-gradient-to-r hover:from-gray-50 hover:to-white"
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
                    <div className="font-bold text-sm text-black flex items-center gap-2">
                      Credit / Debit Card
                      {formData.paymentMethod === 'card' && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Pay securely with your card</div>
                  </div>
                  <div className={`p-2 rounded-lg ${formData.paymentMethod === 'card' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <svg className={`w-5 h-5 ${formData.paymentMethod === 'card' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </label>

                {formData.paymentMethod === 'card' && (
                  <div className="ml-6 space-y-2 pt-3 mt-2 border-t-2 border-blue-100 bg-blue-50 -mx-3 px-3 pb-3 rounded-b-lg">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300 focus:border-black'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-0.5">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                            errors.cardExpiry ? 'border-red-500' : 'border-gray-300 focus:border-black'
                          }`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.cardExpiry && <p className="text-red-500 text-xs mt-0.5">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black mb-1">CVV *</label>
                        <input
                          type="text"
                          name="cardCVV"
                          value={formData.cardCVV || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none transition ${
                            errors.cardCVV ? 'border-red-500' : 'border-gray-300 focus:border-black'
                          }`}
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors.cardCVV && <p className="text-red-500 text-xs mt-0.5">{errors.cardCVV}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] bg-gradient-to-r hover:from-gray-50 hover:to-white"
                  style={{
                    borderColor: formData.paymentMethod === 'paypal' ? '#0070ba' : '#d1d5db',
                    backgroundColor: formData.paymentMethod === 'paypal' ? '#f0f7ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-black flex items-center gap-2">
                      PayPal
                      {formData.paymentMethod === 'paypal' && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Pay with your PayPal account</div>
                  </div>
                  <div className={`p-2 rounded-lg ${formData.paymentMethod === 'paypal' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <svg className={`w-5 h-5 ${formData.paymentMethod === 'paypal' ? 'text-white' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.17a.804.804 0 01-.794.68H7.72a.483.483 0 01-.477-.558L9.187 7.99a.962.962 0 01.949-.8h4.087c1.032 0 1.946.124 2.742.39 1.17.39 2.015 1.038 2.538 1.989.164.297.296.611.396.937l.168-.028z"/>
                    </svg>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sticky top-20 shadow-lg border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-black">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedColor}-${index}`} className="flex gap-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden ring-2 ring-gray-200">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-black truncate">{item.product.name}</h3>
                      <p className="text-xs text-gray-600">{item.selectedColor} • Qty: {item.quantity}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg p-3 shadow-sm space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">
                    {shipping === 0 ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        FREE
                      </span>
                    ) : (
                      <span className="text-black">${shipping.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-bold text-black">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white -mx-3 px-3 -mb-3 pb-3 rounded-b-lg mt-3">
                  <span className="text-base font-bold text-black">Total</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full mt-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Complete Order
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div className="bg-white px-2 py-1 rounded shadow-sm">
                    <span className="font-bold text-blue-600">VISA</span>
                  </div>
                  <div className="bg-white px-2 py-1 rounded shadow-sm">
                    <span className="font-bold text-orange-600">MasterCard</span>
                  </div>
                  <div className="bg-white px-2 py-1 rounded shadow-sm">
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
