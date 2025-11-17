'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { orderService, OrderSummary, OrderStatus } from '@/lib/api/orderService';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc'; status?: OrderStatus; searchTerm?: string } = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      const response = await orderService.getUserOrders(params);
      if (response.success) {
        setOrderSummaries(response.data.items);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch orders:', error);
      const typedError = error as { response?: { data?: { message?: string } } };
      toast.error(typedError.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UNPAID':
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

  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      case 'FAILED':
        return 'Thất bại';
      case 'UNPAID':
      default:
        return 'Chưa thanh toán';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
      case OrderStatus.DELIVERED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case OrderStatus.PREPARING:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case OrderStatus.SHIPPING:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case OrderStatus.PENDING:
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
      <div className="min-h-screen bg-white">
        <Header theme="light" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        <Footer />
      </div>
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
              <span>ĐƠN HÀNG CỦA BẠN</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">Đơn hàng của bạn</h1>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
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

            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => {
                  setFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tất cả ({orderSummaries.length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.PENDING);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.PENDING
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Chờ xử lý ({orderSummaries.filter(o => o.status === OrderStatus.PENDING).length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.CONFIRMED);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.CONFIRMED
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đã xác nhận ({orderSummaries.filter(o => o.status === OrderStatus.CONFIRMED).length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.PREPARING);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.PREPARING
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đang chuẩn bị ({orderSummaries.filter(o => o.status === OrderStatus.PREPARING).length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.SHIPPING);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.SHIPPING
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đang giao hàng ({orderSummaries.filter(o => o.status === OrderStatus.SHIPPING).length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.DELIVERED);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.DELIVERED
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đã giao hàng ({orderSummaries.filter(o => o.status === OrderStatus.DELIVERED).length})
              </button>
              <button
                onClick={() => {
                  setFilter(OrderStatus.CANCELLED);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === OrderStatus.CANCELLED
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Đã hủy ({orderSummaries.filter(o => o.status === OrderStatus.CANCELLED).length})
              </button>
            </div>
          </div>

          {orderSummaries.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">Không có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!'
                  : `Không có đơn hàng nào trong trạng thái "${formatStatus(filter)}"`
                }
              </p>
              <Link href="/shop" className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-block">
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {orderSummaries.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="font-bold text-black">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Đặt vào ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {formatStatus(order.status)}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {formatPaymentStatus(order.paymentStatus)}
                          </span>
                          <Link
                            href={`/orders/${order.orderNumber}`}
                            className="text-black hover:text-gray-700 font-medium text-sm"
                          >
                            Xem chi tiết →
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="font-semibold text-black mb-2">Thông tin đơn hàng</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Khách hàng:</span>
                            <span className="ml-2 font-medium text-black">{order.customerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Số lượng sản phẩm:</span>
                            <span className="ml-2 font-medium text-black">{order.itemCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <span>Tổng cộng: </span>
                          <span className="font-bold text-black text-lg">{formatCurrency(order.total)}</span>
                        </div>
                        {order.status === OrderStatus.PENDING && (
                          <div className="flex items-center gap-2 text-yellow-600 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đang chờ admin xác nhận
                          </div>
                        )}
                        {order.status === OrderStatus.SHIPPING && (
                          <div className="flex items-center gap-2 text-orange-600 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đang được giao hàng
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
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
            </>
          )}
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}