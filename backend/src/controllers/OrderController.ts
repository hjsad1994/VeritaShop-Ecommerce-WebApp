import { Request, Response, NextFunction } from 'express';
import { OrderService, CreateOrderInput } from '../services/OrderService';
import { OrderDto, OrderSummaryDto } from '../dtos/OrderDto';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderFilters } from '../repositories/OrderRepository';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * @route   POST /api/orders
   * @desc    Create a new order from cart
   * @access  Private
   */
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const orderInput: CreateOrderInput = {
        userId,
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
        shippingFee: req.body.shippingFee,
        discount: req.body.discount,
      };

      const order = await this.orderService.createOrder(orderInput);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_ORDER_SUCCESS,
        data: OrderDto.fromOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/orders
   * @desc    Get user's orders (authenticated users) or all orders (admin)
   * @access  Private
   */
  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const filters: OrderFilters = {};
      if (req.query.status) {
        filters.status = req.query.status as OrderStatus;
      }
      if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus as PaymentStatus;
      }
      if (req.query.searchTerm) {
        filters.searchTerm = req.query.searchTerm as string;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const result = await this.orderService.getOrders(
        userId,
        userRole,
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_ORDERS_SUCCESS,
        data: OrderSummaryDto.fromOrderList(result.data, page, limit, result.total),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/orders/:id
   * @desc    Get order details
   * @access  Private
   */
  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const orderId = req.params.id;

      const order = await this.orderService.getOrderById(orderId, userId, userRole);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_ORDER_SUCCESS,
        data: OrderDto.fromOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   PUT /api/orders/:id/status
   * @desc    Update order status (admin/manager only)
   * @access  Private/Admin
   */
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const orderId = req.params.id;
      const { status, paymentStatus } = req.body;

      const order = await this.orderService.updateOrderStatus(
        orderId,
        userId,
        userRole,
        status as OrderStatus,
        paymentStatus as PaymentStatus | undefined
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_ORDER_STATUS_SUCCESS,
        data: OrderDto.fromOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   PUT /api/orders/:id/cancel
   * @desc    Cancel order
   * @access  Private
   */
  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const orderId = req.params.id;
      const { cancelReason } = req.body;

      const order = await this.orderService.cancelOrder(orderId, userId, userRole, cancelReason);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CANCEL_ORDER_SUCCESS,
        data: OrderDto.fromOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   PUT /api/orders/:id/confirm-delivery
   * @desc    Confirm order delivery (user confirms received order)
   * @access  Private
   */
  confirmDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const orderId = req.params.id;

      const order = await this.orderService.confirmDelivery(orderId, userId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CONFIRM_DELIVERY_SUCCESS,
        data: OrderDto.fromOrder(order),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/orders/admin/all
   * @desc    Admin get all orders with advanced filters
   * @access  Private/Admin
   */
  getAllOrdersAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const filters: OrderFilters = {};
      if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }
      if (req.query.status) {
        filters.status = req.query.status as OrderStatus;
      }
      if (req.query.paymentStatus) {
        filters.paymentStatus = req.query.paymentStatus as PaymentStatus;
      }
      if (req.query.searchTerm) {
        filters.searchTerm = req.query.searchTerm as string;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const result = await this.orderService.getAllOrdersAdmin(
        userId,
        userRole,
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_ORDERS_SUCCESS,
        data: OrderDto.fromOrderList(result.data, page, limit, result.total),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/orders/statistics
   * @desc    Get order statistics
   * @access  Private
   */
  getOrderStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      // If not admin, get stats for current user only
      const statsUserId = userRole === 'ADMIN' || userRole === 'MANAGER' ? undefined : userId;

      const statistics = await this.orderService.getOrderStatistics(statsUserId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Lấy thống kê đơn hàng thành công',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };
}
