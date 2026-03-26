import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { RepositoryFactory } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { CreateOrderData, OrderFilters, OrderListOptions } from '../repositories/OrderRepository';

export interface CreateOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod?: string;
  notes?: string;
  shippingFee?: number;
  discount?: number;
}

export class OrderService {
  private orderRepository: OrderRepository;
  private cartRepository: CartRepository;

  constructor() {
    this.orderRepository = RepositoryFactory.getOrderRepository();
    this.cartRepository = RepositoryFactory.getCartRepository();
  }

  /**
   * 1. Create order from cart
   */
  async createOrder(orderInput: CreateOrderInput) {
    const { userId } = orderInput;

    // Get user's cart
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.CART_EMPTY);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.variant.isActive) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Sản phẩm "${item.variant.product.name}" không còn khả dụng`
        );
      }

      if (item.variant.stock < item.quantity) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Sản phẩm "${item.variant.product.name}" chỉ còn ${item.variant.stock} sản phẩm trong kho`
        );
      }
    }

    // Generate unique order number
    const orderNumber = await this.orderRepository.generateOrderNumber();

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const shippingFee = orderInput.shippingFee || 0;
    const discount = orderInput.discount || 0;
    const tax = 0; // Can be calculated based on business logic
    const total = subtotal + shippingFee - discount + tax;

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      variantId: item.variantId,
      productName: item.variant.product.name,
      variantInfo: `${item.variant.color}${item.variant.storage ? ' - ' + item.variant.storage : ''}`,
      price: Number(item.variant.price),
      quantity: item.quantity,
      subtotal: Number(item.variant.price) * item.quantity,
    }));

    // Prepare order data
    const orderData: CreateOrderData = {
      userId,
      orderNumber,
      customerName: orderInput.customerName,
      customerEmail: orderInput.customerEmail,
      customerPhone: orderInput.customerPhone,
      shippingAddress: orderInput.shippingAddress,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      paymentMethod: orderInput.paymentMethod,
      notes: orderInput.notes,
      cartId: cart.id,
      items: orderItems,
    };
    // Create order (includes stock update)
    const order = await this.orderRepository.create(orderData);

    logger.info(`Order created successfully: ${orderNumber} by user ${userId}`);

    return order;
  }

  /**
   * 2. Get user's orders (or all orders for admin)
   */
  async getOrders(
    userId: string,
    userRole: string,
    filters?: OrderFilters,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const options: OrderListOptions = {
      filters: {
        ...filters,
      },
      page,
      limit,
      sortBy,
      sortOrder,
    };

    // If not admin, only show user's own orders
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      options.filters!.userId = userId;
    }

    const result = await this.orderRepository.findAll(options);

    logger.info(
      `Retrieved ${result.data.length} orders for ${userRole === 'ADMIN' || userRole === 'MANAGER' ? 'admin' : `user ${userId}`}`
    );

    return result;
  }

  /**
   * 3. Get order by ID or order number with authorization check
   */
  async getOrderById(orderIdOrNumber: string, userId: string, userRole: string) {
    let order = await this.orderRepository.findById(orderIdOrNumber);

    // If not found by ID, try to find by order number
    if (!order) {
      order = await this.orderRepository.findByOrderNumber(orderIdOrNumber);
    }

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Authorization check: user can only view their own orders
    const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';
    if (!isAdmin && order.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ORDER_UNAUTHORIZED);
    }

    logger.info(`Order ${order.id} (${order.orderNumber}) retrieved by ${isAdmin ? 'admin' : `user ${userId}`}`);

    return order;
  }

  /**
   * 4. Update order status (Admin/Manager only)
   */
  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) {
    // Check admin permission
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Prepare additional data
    const additionalData: any = {};

    if (paymentStatus) {
      additionalData.paymentStatus = paymentStatus;
      if (paymentStatus === PaymentStatus.PAID) {
        additionalData.isPaid = true;
        additionalData.paidAt = new Date();
      }
    }

    if (status === OrderStatus.DELIVERED) {
      additionalData.deliveredAt = new Date();
    }

    const updatedOrder = await this.orderRepository.updateStatus(orderId, status, additionalData);

    logger.info(`Order ${orderId} status updated to ${status} by admin ${userId}`);

    return updatedOrder;
  }

  /**
   * 5. Cancel order (User can cancel PENDING orders, Admin can cancel any)
   */
  async cancelOrder(orderId: string, userId: string, userRole: string, cancelReason?: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    const isAdmin = userRole === 'ADMIN' || userRole === 'MANAGER';

    // Authorization check
    if (!isAdmin && order.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ORDER_UNAUTHORIZED);
    }

    // User can cancel PENDING and CONFIRMED orders
    if (!isAdmin && (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }

    // Admin can cancel PENDING and CONFIRMED orders
    if (isAdmin && order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }

    // Cannot cancel orders that are already in progress
    if (order.status === OrderStatus.PROCESSING || order.status === OrderStatus.SHIPPING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }

    // Cannot cancel delivered orders
    if (order.status === OrderStatus.DELIVERED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.ORDER_ALREADY_DELIVERED);
    }

    // Cannot cancel already cancelled orders
    if (order.status === OrderStatus.CANCELLED) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Đơn hàng đã được hủy trước đó');
    }

    const cancelledOrder = await this.orderRepository.cancel(orderId, cancelReason);

    logger.info(`Order ${orderId} cancelled by ${isAdmin ? `admin ${userId}` : `user ${userId}`}`);

    return cancelledOrder;
  }

  /**
   * 6. Confirm delivery (User confirms received order)
   */
  async confirmDelivery(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Only order owner can confirm delivery
    if (order.userId !== userId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.ORDER_UNAUTHORIZED);
    }

    // Order must be in SHIPPING status
    if (order.status !== OrderStatus.SHIPPING) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Chỉ có thể xác nhận đơn hàng đang trong trạng thái giao hàng'
      );
    }

    const updatedOrder = await this.orderRepository.updateStatus(orderId, OrderStatus.DELIVERED, {
      deliveredAt: new Date(),
    });

    logger.info(`Order ${orderId} confirmed as delivered by user ${userId}`);

    return updatedOrder;
  }

  /**
   * 7. Get all orders for admin with advanced filters
   */
  async getAllOrdersAdmin(
    userId: string,
    userRole: string,
    filters?: OrderFilters,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    // Check admin permission
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    const options: OrderListOptions = {
      filters,
      page,
      limit,
      sortBy,
      sortOrder,
    };

    const result = await this.orderRepository.findAll(options);

    logger.info(`Admin ${userId} retrieved ${result.data.length} orders`);

    return result;
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(userId?: string) {
    return await this.orderRepository.getStatistics(userId);
  }

  /**
   * Private helper: Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Không thể chuyển từ trạng thái ${currentStatus} sang ${newStatus}`
      );
    }
  }
}
