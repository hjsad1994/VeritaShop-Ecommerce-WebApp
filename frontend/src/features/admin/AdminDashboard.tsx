'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
}

interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState([
    {
      title: 'Total Revenue',
      value: '$0',
      change: '+0%',
      isPositive: true,
      iconColor: 'bg-green-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '+0%',
      isPositive: true,
      iconColor: 'bg-blue-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      title: 'Pending Orders',
      value: '0',
      change: '0',
      isPositive: false,
      iconColor: 'bg-orange-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Confirmed Orders',
      value: '0',
      change: '+0%',
      isPositive: true,
      iconColor: 'bg-emerald-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('veritas-orders') || '[]');
      setOrders(savedOrders);
      
      // Calculate stats
      const totalOrders = savedOrders.length;
      const pendingOrders = savedOrders.filter((order: Order) => order.status === 'pending').length;
      const confirmedOrders = savedOrders.filter((order: Order) => order.status === 'confirmed').length;
      const totalRevenue = savedOrders
        .filter((order: Order) => order.status === 'confirmed')
        .reduce((sum: number, order: Order) => sum + order.total, 0);
      
      setStats([
        {
          title: 'Total Revenue',
          value: `$${totalRevenue.toFixed(2)}`,
          change: confirmedOrders > 0 ? '+12.5%' : '+0%',
          isPositive: true,
          iconColor: 'bg-black',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Total Orders',
          value: totalOrders.toString(),
          change: totalOrders > 0 ? '+8.2%' : '+0%',
          isPositive: true,
          iconColor: 'bg-black',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          )
        },
        {
          title: 'Pending Orders',
          value: pendingOrders.toString(),
          change: pendingOrders > 0 ? `${pendingOrders} needs attention` : 'None',
          isPositive: false,
          iconColor: 'bg-black',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Confirmed Orders',
          value: confirmedOrders.toString(),
          change: confirmedOrders > 0 ? `+${confirmedOrders}` : '0',
          isPositive: true,
          iconColor: 'bg-black',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: `#${order.id}`,
    customer: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
    product: order.items.length > 0 ? order.items[0].product.name : 'Multiple items',
    amount: `$${order.total.toFixed(2)}`,
    status: order.status === 'confirmed' ? 'Completed' : order.status === 'rejected' ? 'Rejected' : 'Pending',
    date: new Date(order.date).toLocaleDateString('en-US')
  }));

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 342, revenue: '$409,800', image: '/api/placeholder/60/60' },
    { name: 'Samsung Galaxy S24 Ultra', sales: 287, revenue: '$344,400', image: '/api/placeholder/60/60' },
    { name: 'ASUS ROG Phone 8 Pro', sales: 198, revenue: '$237,600', image: '/api/placeholder/60/60' },
    { name: 'OnePlus 12', sales: 156, revenue: '$124,644', image: '/api/placeholder/60/60' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.iconColor} rounded-lg text-white shadow-sm`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Recent Orders</h3>
            <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.product}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-black mb-6">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link 
              href="/admin/orders" 
              className="w-full flex items-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Orders ({orders.filter(o => o.status === 'pending').length} pending)
            </Link>
            <Link 
              href="/admin/products"
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Product
            </Link>
            <Link 
              href="/admin/categories"
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">Low Stock Alert</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="text-sm font-semibold text-black">iPhone 15 Pro</p>
                <p className="text-xs text-gray-600">Only 3 left</p>
              </div>
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm font-semibold text-black">Galaxy S24</p>
                <p className="text-xs text-gray-600">Only 7 left</p>
              </div>
              <span className="text-yellow-600 font-bold">!</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Server Status</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Database</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Last Backup</span>
              <span className="text-sm text-gray-600">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
