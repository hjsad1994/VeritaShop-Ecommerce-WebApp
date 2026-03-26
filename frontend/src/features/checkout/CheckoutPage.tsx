'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/lib/api/orderService';
import { paymentService } from '@/lib/api/paymentService';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'COD',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Pre-fill form with user profile data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
        shippingAddress: user.address || prev.shippingAddress,
      }));
    }
  }, [user]);

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 3000000 ? 0 : 30000; // Free shipping for orders > 3M VND
  const tax = subtotal * 0.1; // 10% tax
  const discount = 0; // No discount for now
  const total = subtotal + shippingFee + tax - discount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Họ tên là bắt buộc';
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email không hợp lệ';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Địa chỉ giao hàng là bắt buộc';
    } else if (formData.shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = 'Địa chỉ giao hàng phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (items.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with backend API
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        const createdOrder = response.data;

        // Clear cart after successful order creation
        await clearCart();

        // Handle MoMo payment
        if (formData.paymentMethod === 'MOMO') {
          toast.loading('Đang chuyển đến trang thanh toán MoMo...');
          
          try {
            const momoResponse = await paymentService.createMomoPayment(createdOrder.id);
            
            if (momoResponse.success && momoResponse.data.payUrl) {
              // Redirect to MoMo payment page
              window.location.href = momoResponse.data.payUrl;
              return;
            } else {
              throw new Error('Không thể tạo thanh toán MoMo');
            }
          } catch (momoError) {
            console.error('MoMo payment error:', momoError);
            toast.error('Lỗi thanh toán MoMo. Đơn hàng đã được tạo, vui lòng thanh toán sau.');
            router.push(`/order-confirmation?orderNumber=${createdOrder.orderNumber}`);
            return;
          }
        }

        // COD payment - redirect to confirmation
        toast.success('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
        router.push(`/order-confirmation?orderNumber=${createdOrder.orderNumber}`);
      } else {
        throw new Error(response.message || 'Đặt hàng thất bại');
      }
    } catch (error: unknown) {
      console.error('Order creation failed:', error);
      const typedError = error as {
        response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } };
        message?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
      const fieldErrors = typedError.response?.data?.errors || typedError.errors || [];
      const shippingAddressError = fieldErrors.find((item) => item.field === 'shippingAddress')?.message;
      const errorMessage =
        shippingAddressError ||
        fieldErrors[0]?.message ||
        typedError.response?.data?.message ||
        typedError.message ||
        'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';

      if (shippingAddressError) {
        setErrors((prev) => ({ ...prev, shippingAddress: shippingAddressError }));
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency to VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
            <h2 className="text-3xl font-bold text-black mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-600 mb-8">Thêm một số sản phẩm trước khi thanh toán</p>
            <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-block">
              Tiếp tục mua sắm
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
          <span className="font-semibold tracking-wide">THANH TOÁN AN TOÀN - ĐƯỢC MÃ HÓA SSL</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition">Trang chủ</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black transition">Cửa hàng</Link>
            <span>/</span>
            <span className="text-black font-medium">Thanh toán</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Thanh toán</h1>
            <p className="text-sm text-gray-600">Hoàn tất đơn hàng an toàn của bạn</p>
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
                  <h2 className="text-xl font-bold text-gray-900">Thông tin liên hệ</h2>
                  <p className="text-sm text-gray-600">Chi tiết cá nhân của bạn để xử lý đơn hàng</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Họ và tên</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.customerName
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Email</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.customerEmail
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="email@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Số điện thoại</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.customerPhone
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="0912345678"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-black p-3 rounded-xl shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                  <p className="text-sm text-gray-600">Chúng tôi nên giao đơn hàng của bạn đến đâu?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <span>Địa chỉ</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all text-black placeholder:text-gray-400 ${errors.shippingAddress ? 'border-gray-800 bg-gray-100' : 'border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-200 bg-white'
                      }`}
                    placeholder="123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
                  />
                  {errors.shippingAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>
                  )}
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span>Ghi chú (tùy chọn)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200 bg-white text-black placeholder:text-gray-400"
                    placeholder="Ghi chú đặc biệt về giao hàng..."
                  />
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
                  <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
                  <p className="text-sm text-gray-600">Chọn phương thức thanh toán ưa thích của bạn</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'COD' ? '#10b981' : '#d1d5db',
                    backgroundColor: formData.paymentMethod === 'COD' ? '#f0fdf4' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-black">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-600">Thanh toán khi nhận được đơn hàng của bạn</div>
                  </div>
                  {formData.paymentMethod === 'COD' && (
                    <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">Đã chọn</span>
                  )}
                </label>

                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'MOMO' ? '#a50064' : '#d1d5db',
                    backgroundColor: formData.paymentMethod === 'MOMO' ? '#fdf2f8' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    checked={formData.paymentMethod === 'MOMO'}
                    onChange={handleChange}
                    className="w-4 h-4 text-pink-600"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <div>
                      <div className="font-semibold text-black">Ví MoMo</div>
                      <div className="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</div>
                    </div>
                  </div>
                  {formData.paymentMethod === 'MOMO' && (
                    <span className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full">Đã chọn</span>
                  )}
                </label>
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
                <h2 className="text-xl font-bold text-black">Tóm tắt đơn hàng</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border-2 border-gray-200">
                      {item.variant.product.images && item.variant.product.images.length > 0 ? (
                        <Image
                          src={item.variant.product.images[0].url}
                          alt={item.variant.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate">{item.variant.product.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.variant.color} {item.variant.storage && `• ${item.variant.storage}`} • Số lượng: {item.quantity}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold text-black">
                          {formatCurrency(item.itemSubtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold text-black">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-black font-semibold">MIỄN PHÍ</span>
                    ) : (
                      <span className="text-black">{formatCurrency(shippingFee)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế (10%)</span>
                  <span className="font-semibold text-black">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-black">Tổng cộng</span>
                  <span className="text-xl font-bold text-black">
                    {formatCurrency(total)}
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
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Hoàn tất đơn hàng
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
                    <span className="font-bold text-blue-700">COD</span>
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
