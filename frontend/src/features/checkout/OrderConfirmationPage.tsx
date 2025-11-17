'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { orderService, Order } from '@/lib/api/orderService';
import toast from 'react-hot-toast';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
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
        // Try to find order by orderNumber first
        const response = await orderService.getOrderById(orderNumber);

        if (response.success) {
          setOrder(response.data);
        } else {
          // If not found by orderNumber, try by ID (for backward compatibility)
          const responseById = await orderService.getOrderById(orderNumber);
          if (responseById.success) {
            setOrder(responseById.data);
          } else {
            setError('Không tìm thấy đơn hàng');
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        setError(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen bg-white">
        <Header theme="light" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16">
          <div className="text-center">
            <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-black mb-4">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-8">{error || 'Chúng tôi không thể tìm thấy đơn hàng bạn đang tìm kiếm.'}</p>
            <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-block">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Format currency to VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusInfo = () => {
    switch (order.status) {
      case 'CONFIRMED':
        return {
          bgColor: 'bg-gradient-to-r from-green-600 to-green-700',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN - CẢM ƠN BẠN ĐÃ MUA HÀNG!',
          message: 'Đơn hàng của bạn đã được xác nhận và đang được xử lý.',
          headerColor: 'text-green-600'
        };
      case 'CANCELLED':
        return {
          bgColor: 'bg-gradient-to-r from-red-600 to-red-700',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          title: 'ĐƠN HÀNG ĐÃ BỊ HỦY',
          message: 'Đơn hàng của bạn đã bị hủy. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.',
          headerColor: 'text-red-600'
        };
      case 'PENDING':
      default:
        return {
          bgColor: 'bg-gradient-to-r from-yellow-600 to-orange-600',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'ĐƠN HÀNG ĐANG CHỜ XÁC NHẬN',
          message: 'Đơn hàng của bạn đang chờ admin xác nhận. Vui lòng kiểm tra lại sau.',
          headerColor: 'text-yellow-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-white">
      <Header theme="light" />

      <div className={`${statusInfo.bgColor} text-white py-4 text-center font-medium mt-16`}>
        <div className="flex items-center justify-center gap-2">
          {statusInfo.icon}
          <span>{statusInfo.title}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        {/* Status Message */}
        <div className="text-center mb-12">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${order.status === 'CONFIRMED' ? 'bg-green-100' :
              order.status === 'CANCELLED' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
            {order.status === 'CONFIRMED' ? (
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : order.status === 'CANCELLED' ? (
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${order.status === 'CONFIRMED' ? 'text-green-600' :
              order.status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'
            }`}>
            {order.status === 'CONFIRMED' ? 'Đơn hàng đã được xác nhận!' :
              order.status === 'CANCELLED' ? 'Đơn hàng đã bị hủy!' :
                'Đơn hàng đang chờ xác nhận!'}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {statusInfo.message}
          </p>
          <p className="text-gray-600">
            {order.status === 'CONFIRMED'
              ? `Một email xác nhận đã được gửi đến ${order.customerEmail}`
              : `Thông tin đơn hàng đã được gửi đến ${order.customerEmail}`
            }
          </p>
        </div>

        {/* Order Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Chi tiết đơn hàng
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-bold text-black">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt:</span>
                <span className="font-bold text-black">{orderDate.toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-bold text-black capitalize">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod || 'Chưa xác định'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                <span className={`font-bold text-black ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                   order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Địa chỉ giao hàng
            </h3>
            <div className="text-sm text-gray-700">
              <p className="font-bold text-black">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p className="mt-2">
                <span className="text-gray-600">Email:</span> {order.customerEmail}
              </p>
              <p>
                <span className="text-gray-600">Điện thoại:</span> {order.customerPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className={`${order.status === 'CONFIRMED' ? 'bg-green-50' : order.status === 'CANCELLED' ? 'bg-red-50' : 'bg-blue-50'} rounded-2xl p-6 mb-8`}>
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            Trạng thái đơn hàng
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full ${order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'bg-green-600' :
                    order.status === 'CANCELLED' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}></div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'bg-green-600' :
                    order.status === 'CANCELLED' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}></div>
                <div className={`w-3 h-3 rounded-full ${order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'PREPARING' || order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                <div className={`w-3 h-3 rounded-full ${order.status === 'SHIPPING' || order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                <div className={`w-3 h-3 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Đã đặt hàng</span>
                <span>Đã xác nhận</span>
                <span>Đang chuẩn bị</span>
                <span>Đang giao hàng</span>
                <span>Đã giao hàng</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-4">
            {order.status === 'CONFIRMED'
              ? `Đơn hàng của bạn đã được xác nhận và sẽ được giao trước ngày ${estimatedDelivery.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
              : order.status === 'CANCELLED'
                ? order.cancelReason ? `Đơn hàng của bạn đã bị hủy. Lý do: ${order.cancelReason}` : 'Đơn hàng của bạn đã bị hủy. Vui lòng liên hệ với bộ phận hỗ trợ khách hàng để biết thêm chi tiết.'
                : 'Đơn hàng của bạn đang chờ admin xác nhận. Chúng tôi sẽ xử lý trong thời gian sớm nhất.'
            }
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-black mb-4">Sản phẩm đã đặt</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.variant.product.images && item.variant.product.images.length > 0 ? (
                    <Image
                      src={item.variant.product.images[0].url}
                      alt={item.productName}
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
                <div className="flex-1">
                  <h4 className="font-bold text-black">{item.productName}</h4>
                  <p className="text-sm text-gray-600">
                    Màu sắc: {item.variant.color} {item.variant.storage && `• Bộ nhớ: ${item.variant.storage}`}
                  </p>
                  <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">{formatCurrency(item.subtotal)}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(item.price)} mỗi sản phẩm</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-bold text-black">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-bold text-red-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-bold text-black">
                  {order.shippingFee === 0 ? <span className="text-green-600">MIỄN PHÍ</span> : formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế</span>
                <span className="font-bold text-black">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-lg font-bold text-black">Tổng cộng</span>
                <span className="text-2xl font-bold text-black">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors text-center"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href={`/orders/${order.orderNumber}`}
            className="bg-white border-2 border-black text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Xem chi tiết đơn hàng
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-black mb-2">Cần trợ giúp?</h3>
          <p className="text-gray-600 mb-4">
            Nếu bạn có bất kỳ câu hỏi nào về đơn hàng của mình, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a href="mailto:support@veritashop.com" className="text-black hover:underline flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@veritashop.com
            </a>
            <a href="tel:+84123456789" className="text-black hover:underline flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +84 123 456 789
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}