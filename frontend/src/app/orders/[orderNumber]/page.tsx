'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import Image from 'next/image';
import { orderService, Order, OrderStatus, PaymentStatus } from '@/lib/api/orderService';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setError('Không tìm thấy mã đơn hàng');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await orderService.getOrderById(orderNumber);

        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Không tìm thấy đơn hàng');
        }
      } catch (error: unknown) {
        console.error('Failed to fetch order:', error);
        const typedError = error as { response?: { data?: { message?: string } } };
        setError(typedError.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!order) return;

    const reason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (!reason) return;

    try {
      const response = await orderService.cancelOrder(order.id, { cancelReason: reason });
      if (response.success) {
        setOrder(response.data);
        toast.success('Đơn hàng đã được hủy thành công');
      }
    } catch (error: unknown) {
      console.error('Failed to cancel order:', error);
      const typedError = error as { response?: { data?: { message?: string } } };
      toast.error(typedError.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    try {
      const response = await orderService.confirmDelivery(order.id);
      if (response.success) {
        setOrder(response.data);
        toast.success('Đã xác nhận nhận hàng thành công');
      }
    } catch (error: unknown) {
      console.error('Failed to confirm delivery:', error);
      const typedError = error as { response?: { data?: { message?: string } } };
      toast.error(typedError.response?.data?.message || 'Không thể xác nhận nhận hàng');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.DELIVERED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case OrderStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.SHIPPING:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800 border-green-200';
      case PaymentStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800 border-red-200';
      case PaymentStatus.UNPAID:
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatStatus = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.PREPARING:
        return 'Đang chuẩn bị';
      case OrderStatus.SHIPPING:
        return 'Đang giao hàng';
      case OrderStatus.DELIVERED:
        return 'Đã giao hàng';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      case OrderStatus.REFUNDED:
        return 'Đã hoàn tiền';
      case OrderStatus.PENDING:
      default:
        return 'Chờ xử lý';
    }
  };

  const formatPaymentStatus = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'Đã thanh toán';
      case PaymentStatus.REFUNDED:
        return 'Đã hoàn tiền';
      case PaymentStatus.FAILED:
        return 'Thất bại';
      case PaymentStatus.UNPAID:
      default:
        return 'Chưa thanh toán';
    }
  };

  // Format currency to VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white">
          <Header theme="light" />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  if (!order || error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white">
          <Header theme="light" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
            <div className="text-center">
              <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold text-black mb-4">Không tìm thấy đơn hàng</h2>
              <p className="text-gray-600 mb-8">{error || 'Chúng tôi không thể tìm thấy đơn hàng bạn đang tìm kiếm.'}</p>
              <Link href="/orders" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-block">
                Quay lại danh sách đơn hàng
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Header theme="light" />

        <div className="bg-gray-50 py-4 text-center text-sm font-medium mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>CHI TIẾT ĐƠN HÀNG</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Chi tiết đơn hàng</h1>
                <p className="text-gray-600">Mã đơn hàng: <span className="font-medium text-black">{order.orderNumber}</span></p>
              </div>
              <Link href="/orders" className="text-black hover:text-gray-700 font-medium">
                ← Quay lại danh sách
              </Link>
            </div>

            {/* Status and Payment Status */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                {formatPaymentStatus(order.paymentStatus)}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin khách hàng
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-black font-semibold mb-1">Họ tên:</p>
                <p className="text-black">{order.customerName}</p>
              </div>
              <div>
                <p className="text-black font-semibold mb-1">Email:</p>
                <p className="text-black">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-black font-semibold mb-1">Số điện thoại:</p>
                <p className="text-black">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-black font-semibold mb-1">Phương thức thanh toán:</p>
                <p className="text-black font-medium">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod || 'Chưa xác định'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-black font-semibold mb-1">Địa chỉ giao hàng:</p>
                <p className="text-black">{order.shippingAddress}</p>
              </div>
              {order.notes && (
                <div className="md:col-span-2">
                  <p className="text-black font-semibold mb-1">Ghi chú:</p>
                  <p className="text-black">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Sản phẩm đã đặt ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                    {item.variant.product.images && item.variant.product.images.length > 0 ? (
                      <Image
                        src={item.variant.product.images[0].url}
                        alt={item.productName}
                        width={80}
                        height={80}
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-black text-lg">{item.productName}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm text-black bg-gray-200 px-3 py-1 rounded-full">
                        Màu sắc: {item.variant.color}
                      </p>
                      {item.variant.storage && (
                        <p className="text-sm text-black bg-gray-200 px-3 py-1 rounded-full">
                          Bộ nhớ: {item.variant.storage}
                        </p>
                      )}
                      <p className="text-sm text-black bg-gray-200 px-3 py-1 rounded-full">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black text-lg">{formatCurrency(item.subtotal)}</p>
                    <p className="text-sm text-black">{formatCurrency(item.price)} mỗi sản phẩm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tổng đơn hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="text-black font-semibold">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-red-600 font-semibold">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-black font-semibold">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế:</span>
                <span className="text-black font-semibold">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                <span className="text-black font-bold text-lg">Tổng cộng:</span>
                <span className="font-bold text-xl text-black">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-black mb-4">Hành động</h2>
            <div className="flex flex-wrap gap-3">
              {order.status === OrderStatus.PENDING && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Hủy đơn hàng
                </button>
              )}
              {order.status === OrderStatus.SHIPPING && (
                <button
                  onClick={handleConfirmDelivery}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Xác nhận đã nhận hàng
                </button>
              )}
              <Link
                href="/shop"
                className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Mua sắm tiếp
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}