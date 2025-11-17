import { body, param, query } from 'express-validator';
import { StockMovementType } from '@prisma/client';

/**
 * Validation for stock in
 */
export const stockInValidation = [
  body('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),

  body('quantity')
    .notEmpty()
    .withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương (tối thiểu 1)'),

  body('reason')
    .optional()
    .isString()
    .withMessage('Lý do phải là chuỗi')
    .trim(),

  body('referenceId')
    .optional()
    .isString()
    .withMessage('Reference ID phải là chuỗi')
    .trim(),
];

/**
 * Validation for stock out
 */
export const stockOutValidation = [
  body('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),

  body('quantity')
    .notEmpty()
    .withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương (tối thiểu 1)'),

  body('reason')
    .optional()
    .isString()
    .withMessage('Lý do phải là chuỗi')
    .trim(),

  body('referenceId')
    .optional()
    .isString()
    .withMessage('Reference ID phải là chuỗi')
    .trim(),
];

/**
 * Validation for stock adjustment
 */
export const stockAdjustmentValidation = [
  body('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),

  body('newQuantity')
    .notEmpty()
    .withMessage('Số lượng mới là bắt buộc')
    .isInt({ min: 0 })
    .withMessage('Số lượng mới phải là số nguyên không âm'),

  body('reason')
    .notEmpty()
    .withMessage('Lý do điều chỉnh là bắt buộc')
    .isString()
    .withMessage('Lý do phải là chuỗi')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Lý do phải có ít nhất 5 ký tự'),
];

/**
 * Validation for getting inventory by variant ID
 */
export const getInventoryByVariantIdValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),
];

/**
 * Validation for stock movements
 */
export const getStockMovementsValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),

  query('type')
    .optional()
    .isIn(Object.values(StockMovementType))
    .withMessage(
      `Loại giao dịch phải là một trong: ${Object.values(StockMovementType).join(', ')}`
    ),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số trang phải là số nguyên dương'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng bản ghi phải từ 1 đến 100'),
];

/**
 * Validation for getting all inventory
 */
export const getAllInventoryValidation = [
  query('minAvailable')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng tối thiểu phải là số nguyên không âm'),

  query('maxAvailable')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Số lượng tối đa phải là số nguyên không âm'),

  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('Low stock phải là boolean (true/false)'),

  query('search')
    .optional()
    .isString()
    .withMessage('Từ khóa tìm kiếm phải là chuỗi')
    .trim(),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Số trang phải là số nguyên dương'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Số lượng bản ghi phải từ 1 đến 100'),
];

/**
 * Validation for updating stock thresholds
 */
export const updateStockThresholdsValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),

  body('minStock')
    .notEmpty()
    .withMessage('Ngưỡng tối thiểu là bắt buộc')
    .isInt({ min: 0 })
    .withMessage('Ngưỡng tối thiểu phải là số nguyên không âm'),

  body('maxStock')
    .notEmpty()
    .withMessage('Ngưỡng tối đa là bắt buộc')
    .isInt({ min: 0 })
    .withMessage('Ngưỡng tối đa phải là số nguyên không âm'),
];

/**
 * Validation for checking availability
 */
export const checkAvailabilityValidation = [
  param('variantId')
    .notEmpty()
    .withMessage('Variant ID là bắt buộc')
    .isString()
    .withMessage('Variant ID phải là chuỗi'),
];
