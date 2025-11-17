import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createOrderValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
  confirmDeliveryValidation,
  getOrderByIdValidation,
  getOrdersValidation,
} from '../validations/OrderValidation';

export const createOrderRoutes = (): Router => {
  const router = Router();
  const orderController = new OrderController();

  /**
   * @route   POST /api/orders
   * @desc    Create a new order from cart
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    validate(createOrderValidation),
    orderController.createOrder
  );

  /**
   * @route   GET /api/orders/statistics
   * @desc    Get order statistics
   * @access  Private
   */
  router.get(
    '/statistics',
    authenticate,
    orderController.getOrderStatistics
  );

  /**
   * @route   GET /api/orders/admin/all
   * @desc    Admin get all orders with advanced filters
   * @access  Private/Admin
   */
  router.get(
    '/admin/all',
    authenticate,
    validate(getOrdersValidation),
    orderController.getAllOrdersAdmin
  );

  /**
   * @route   GET /api/orders
   * @desc    Get user's orders (authenticated users)
   * @access  Private
   */
  router.get(
    '/',
    authenticate,
    validate(getOrdersValidation),
    orderController.getOrders
  );

  /**
   * @route   GET /api/orders/:id
   * @desc    Get order details
   * @access  Private
   */
  router.get(
    '/:id',
    authenticate,
    validate(getOrderByIdValidation),
    orderController.getOrderById
  );

  /**
   * @route   PUT /api/orders/:id/status
   * @desc    Update order status (admin/manager only)
   * @access  Private/Admin
   */
  router.put(
    '/:id/status',
    authenticate,
    validate(updateOrderStatusValidation),
    orderController.updateOrderStatus
  );

  /**
   * @route   PUT /api/orders/:id/cancel
   * @desc    Cancel order
   * @access  Private
   */
  router.put(
    '/:id/cancel',
    authenticate,
    validate(cancelOrderValidation),
    orderController.cancelOrder
  );

  /**
   * @route   PUTt /api/orders/:id/confirm-delivery
   * @desc    Confirm order delivery (user confirms received order)
   * @access  Private
   */
  router.put(
    '/:id/confirm-delivery',
    authenticate,
    validate(confirmDeliveryValidation),
    orderController.confirmDelivery
  );

  return router;
};
