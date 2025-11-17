'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { orderService, OrderStatus, PaymentStatus, Order, OrderSummary } from '@/lib/api/orderService';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      const response = await orderService.getAllOrders(params);
      if (response.success) {
        setOrders(response.data.items);
        setTotalPages(response.data.pagination.totalPages);

        // Also create summaries for table view
        const summaries = response.data.items.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          itemCount: order.items.length,
          createdAt: order.createdAt
        }));
        setOrderSummaries(summaries);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { status, paymentStatus });
      if (response.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        fetchOrders(); // Refresh orders list

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(response.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
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

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Quản lý đơn hàng</h2>
        <p className="text-sm text-black">Quản lý đơn hàng của khách hàng và quy trình xử lý</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Filters */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, email, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Tất cả ({orders.length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.PENDING);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.PENDING
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Chờ xử lý ({orders.filter(o => o.status === OrderStatus.PENDING).length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.CONFIRMED);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.CONFIRMED
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Đã xác nhận ({orders.filter(o => o.status === OrderStatus.CONFIRMED).length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.PREPARING);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.PREPARING
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Đang chuẩn bị ({orders.filter(o => o.status === OrderStatus.PREPARING).length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.SHIPPING);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.SHIPPING
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Đang giao hàng ({orders.filter(o => o.status === OrderStatus.SHIPPING).length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.DELIVERED);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.DELIVERED
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Đã giao hàng ({orders.filter(o => o.status === OrderStatus.DELIVERED).length})
            </button>
            <button
              onClick={() => {
                setFilter(OrderStatus.CANCELLED);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === OrderStatus.CANCELLED
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Đã hủy ({orders.filter(o => o.status === OrderStatus.CANCELLED).length})
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Mã đơn hàng</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Khách hàng</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Ngày đặt</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Tổng tiền</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Thanh toán</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orderSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : (
                orderSummaries.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-black">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-black">{order.customerName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-black">{order.orderNumber}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-black">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-black">₫{order.total.toLocaleString('vi-VN')}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {formatPaymentStatus(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewOrderDetails(order.id)}
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>Xem chi tiết</span>
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-black">Chi tiết đơn hàng {selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-black mt-2">
                    Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-black hover:bg-gray-200 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Customer Info */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin khách hàng
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-black font-semibold mb-1">Họ tên:</p>
                      <p className="text-black">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Email:</p>
                      <p className="text-black">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Số điện thoại:</p>
                      <p className="text-black">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Phương thức thanh toán:</p>
                      <p className="text-black font-medium">
                        {selectedOrder.paymentMethod || 'Chưa xác định'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-black font-semibold mb-1">Địa chỉ giao hàng:</p>
                    <p className="text-black">{selectedOrder.shippingAddress}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <p className="text-black font-semibold mb-1">Ghi chú:</p>
                      <p className="text-black">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Sản phẩm ({selectedOrder.items.length})
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
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
                          <p className="font-semibold text-black text-lg">{item.productName}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-black bg-gray-100 px-3 py-1 rounded-full">
                              Màu sắc: {item.variant.color}
                            </p>
                            {item.variant.storage && (
                              <p className="text-sm text-black bg-gray-100 px-3 py-1 rounded-full">
                                Bộ nhớ: {item.variant.storage}
                              </p>
                            )}
                            <p className="text-sm text-black bg-gray-100 px-3 py-1 rounded-full">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black text-lg">
                            ₫{item.subtotal.toLocaleString('vi-VN')}
                          </p>
                          <p className="text-sm text-black">₫{item.price.toLocaleString('vi-VN')} mỗi sản phẩm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tổng đơn hàng
                </h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Tạm tính:</span>
                      <span className="text-black font-semibold">₫{selectedOrder.subtotal.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Giảm giá:</span>
                      <span className="text-black font-semibold">-₫{selectedOrder.discount.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Phí vận chuyển:</span>
                      <span className="text-black font-semibold">
                        {selectedOrder.shippingFee === 0
                          ? 'Miễn phí'
                          : `₫${selectedOrder.shippingFee.toLocaleString('vi-VN')}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Thuế:</span>
                      <span className="text-black font-semibold">₫{selectedOrder.tax.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                      <span className="text-black font-bold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-xl text-black">
                        ₫{selectedOrder.total.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Trạng thái đơn hàng
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border ${getStatusColor(selectedOrder.status)}`}>
                      {formatStatus(selectedOrder.status)}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {formatPaymentStatus(selectedOrder.paymentStatus)}
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-black">Cập nhật trạng thái đơn hàng:</label>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value={OrderStatus.PENDING}>Chờ xử lý</option>
                        <option value={OrderStatus.CONFIRMED}>Đã xác nhận</option>
                        <option value={OrderStatus.PREPARING}>Đang chuẩn bị</option>
                        <option value={OrderStatus.SHIPPING}>Đang giao hàng</option>
                        <option value={OrderStatus.DELIVERED}>Đã giao hàng</option>
                        <option value={OrderStatus.CANCELLED}>Đã hủy</option>
                        <option value={OrderStatus.REFUNDED}>Đã hoàn tiền</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Status Update */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-black">Trạng thái thanh toán:</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status, PaymentStatus.PAID)}
                        disabled={selectedOrder.paymentStatus === PaymentStatus.PAID}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedOrder.paymentStatus === PaymentStatus.PAID
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Đánh dấu đã thanh toán
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status, PaymentStatus.UNPAID)}
                        disabled={selectedOrder.paymentStatus === PaymentStatus.UNPAID}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedOrder.paymentStatus === PaymentStatus.UNPAID
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'
                        }`}
                      >
                        Đánh dấu chưa thanh toán
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === OrderStatus.PENDING && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.CONFIRMED)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Xác nhận đơn hàng
                        </button>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.CANCELLED)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Hủy đơn hàng
                        </button>
                      </>
                    )}
                    {selectedOrder.status === OrderStatus.CONFIRMED && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.PREPARING)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Bắt đầu chuẩn bị
                      </button>
                    )}
                    {selectedOrder.status === OrderStatus.PREPARING && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.SHIPPING)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bắt đầu giao hàng
                      </button>
                    )}
                    {selectedOrder.status === OrderStatus.SHIPPING && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.DELIVERED)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Xác nhận đã giao hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
