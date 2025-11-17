'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  selectedColor: string;
}

interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    paymentMethod: string;
  };
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('veritas-orders') || '[]');
      setOrders(savedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = (orderId: number, newStatus: 'confirmed' | 'rejected') => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('veritas-orders', JSON.stringify(updatedOrders));

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
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
        <h2 className="text-3xl font-bold text-black mb-2">Order Management</h2>
        <p className="text-sm text-black">Manage customer orders and approval process</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Filters */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Confirmed ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Rejected ({orders.filter(o => o.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No orders found matching the current filter
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-black">#{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-black">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-black">{order.customerInfo.email}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-black">
                      {new Date(order.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-black">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>View Details</span>
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
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-black">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                  <p className="text-sm text-black mt-2">
                    Ngày đặt: {new Date(selectedOrder.date).toLocaleString('vi-VN')}
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
                      <p className="text-black">
                        {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Email:</p>
                      <p className="text-black">{selectedOrder.customerInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Số điện thoại:</p>
                      <p className="text-black">{selectedOrder.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-black font-semibold mb-1">Phương thức thanh toán:</p>
                      <p className="text-black font-medium">
                        {selectedOrder.customerInfo.paymentMethod === 'cod'
                          ? 'Thanh toán khi nhận hàng'
                          : selectedOrder.customerInfo.paymentMethod
                        }
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-black font-semibold mb-1">Địa chỉ:</p>
                    <p className="text-black">
                      {selectedOrder.customerInfo.address}, {selectedOrder.customerInfo.city},
                      {selectedOrder.customerInfo.zipCode}, {selectedOrder.customerInfo.country}
                    </p>
                  </div>
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
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain p-2"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-black text-lg">{item.product.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-black bg-gray-100 px-3 py-1 rounded-full">
                              Màu sắc: {item.selectedColor}
                            </p>
                            <p className="text-sm text-black bg-gray-100 px-3 py-1 rounded-full">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black text-lg">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-black">${item.product.price.toFixed(2)} mỗi sản phẩm</p>
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
                      <span className="text-black font-semibold">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Phí vận chuyển:</span>
                      <span className="text-black font-semibold">
                        {selectedOrder.shipping === 0
                          ? 'Miễn phí'
                          : `$${selectedOrder.shipping.toFixed(2)}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Thuế (10%):</span>
                      <span className="text-black font-semibold">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                      <span className="text-black font-bold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-xl text-black">
                        ${selectedOrder.total.toFixed(2)}
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
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold border ${getStatusColor(selectedOrder.status)}`}>
                  {formatStatus(selectedOrder.status)}
                </div>

                {selectedOrder.status === 'pending' && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xác nhận đơn hàng
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Từ chối đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
