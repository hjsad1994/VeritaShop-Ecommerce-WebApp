import { body, param, query } from 'express-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';

/**
 * Validation for creating an order
 */
export const createOrderValidation = [
  body('customerName')
    .notEmpty()
    .withMessage('Tên khách hàng là bắt buộc')
    .isString()
    .withMessage('Tên khách hàng phải là chuỗi')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên khách hàng phải từ 2-100 ký tự'),

  body('customerEmail')
    .notEmpty()
    .withMessage('Email khách hàng là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('customerPhone')
    .notEmpty()
    .withMessage('Số điện thoại là bắt buộc')
    .isString()
    .withMessage('Số điện thoại phải là chuỗi')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),

  body('shippingAddress')
    .notEmpty()
    .withMessage('Địa chỉ giao hàng là bắt buộc')
    .isString()
    .withMessage('Địa chỉ phải là chuỗi')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Địa chỉ phải từ 10-500 ký tự'),

  body('paymentMethod')
    .optional()
    .isString()
    .withMessage('Phương thức thanh toán phải là chuỗi')
    .isIn(['COD', 'MOMO', 'CREDIT_CARD', 'E_WALLET'])
    .withMessage('Phương thức thanh toán không hợp lệ'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Ghi chú phải là chuỗi')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),

  body('shippingFee')
    .optional()
    .isNumeric()
    .withMessage('Phí vận chuyển phải là số')
    .custom((value) => value >= 0)
    .withMessage('Phí vận chuyển không được âm'),

  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Giảm giá phải là số')
    .custom((value) => value >= 0)
    .withMessage('Giảm giá không được âm'),
];

/**
 * Validation for updating order status
 */
export const updateOrderStatusValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID là bắt buộc')
    .isString()
    .withMessage('Order ID phải là chuỗi'),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái đơn hàng là bắt buộc')
    .isIn(Object.values(OrderStatus))
    .withMessage('Trạng thái đơn hàng không hợp lệ'),

  body('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage('Trạng thái thanh toán không hợp lệ'),
];

/**
 * Validation for canceling an order
 */
export const cancelOrderValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID là bắt buộc')
    .isString()
    .withMessage('Order ID phải là chuỗi'),

  body('cancelReason')
    .optional()
    .isString()
    .withMessage('Lý do hủy phải là chuỗi')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Lý do hủy không được vượt quá 500 ký tự'),
];

/**
 * Validation for confirming order delivery
 */
export const confirmDeliveryValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID là bắt buộc')
    .isString()
    .withMessage('Order ID phải là chuỗi'),
];

/**
 * Validation for getting order by ID
 */
export const getOrderByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Order ID là bắt buộc')
    .isString()
    .withMessage('Order ID phải là chuỗi'),
];

/**
 * Validation for getting orders with filters
 */
export const getOrdersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100')
    .toInt(),

  query('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('Trạng thái đơn hàng không hợp lệ'),

  query('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage('Trạng thái thanh toán không hợp lệ'),

  query('searchTerm')
    .optional()
    .isString()
    .withMessage('Từ khóa tìm kiếm phải là chuỗi')
    .trim(),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ')
    .toDate(),

  query('sortBy')
    .optional()
    .isString()
    .withMessage('Trường sắp xếp phải là chuỗi')
    .isIn(['createdAt', 'total', 'status', 'orderNumber'])
    .withMessage('Trường sắp xếp không hợp lệ'),

  query('sortOrder')
    .optional()
    .isString()
    .withMessage('Thứ tự sắp xếp phải là chuỗi')
    .isIn(['asc', 'desc'])
    .withMessage('Thứ tự sắp xếp phải là asc hoặc desc'),
];
