import { apiClient } from './apiClient';
import { ApiResponse, PaginationMeta } from './types';

// Order Types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export interface OrderUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

export interface OrderProductImage {
  id: string;
  url: string;
}

export interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  images: OrderProductImage[];
}

export interface OrderVariant {
  id: string;
  color: string;
  storage: string | null;
  price: number;
  product: OrderProduct;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantInfo: string;
  price: number;
  quantity: number;
  subtotal: number;
  variant: OrderVariant;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  isPaid: boolean;
  paidAt: Date | null;
  notes: string | null;
  cancelReason: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: OrderUser;
  items: OrderItem[];
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: Date;
}

export interface OrderListResponse {
  items: Order[];
  pagination: PaginationMeta;
}

export interface OrderSummaryListResponse {
  items: OrderSummary[];
  pagination: PaginationMeta;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderQueryParams extends OrderFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface CancelOrderRequest {
  cancelReason: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  recentOrders: OrderSummary[];
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
}

class OrderService {
  private baseUrl = '/orders';

  // Get all orders for admin
  async getAllOrders(params?: OrderQueryParams): Promise<ApiResponse<OrderListResponse>> {
    const response = await apiClient.get(`${this.baseUrl}/admin/all`, { params });
    return response.data;
  }

  // Get user's orders
  async getUserOrders(params?: OrderQueryParams): Promise<ApiResponse<OrderSummaryListResponse>> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  // Get order by ID or order number
  async getOrderById(orderIdOrNumber: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get(`${this.baseUrl}/${orderIdOrNumber}`);
    return response.data;
  }

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await apiClient.post(this.baseUrl, orderData);
    return response.data;
  }

  // Update order status (admin/manager only)
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    const response = await apiClient.put(`${this.baseUrl}/${orderId}/status`, data);
    return response.data;
  }

  // Cancel order
  async cancelOrder(orderId: string, data: CancelOrderRequest): Promise<ApiResponse<Order>> {
    const response = await apiClient.put(`${this.baseUrl}/${orderId}/cancel`, data);
    return response.data;
  }

  // Confirm delivery
  async confirmDelivery(orderId: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.put(`${this.baseUrl}/${orderId}/confirm-delivery`);
    return response.data;
  }

  // Get order statistics
  async getOrderStatistics(): Promise<ApiResponse<OrderStatistics>> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`);
    return response.data;
  }
}

export const orderService = new OrderService();