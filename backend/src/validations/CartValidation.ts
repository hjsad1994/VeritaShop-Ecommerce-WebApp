import { body, param } from 'express-validator';

/**
 * Validation for adding item to cart
 */
export const addCartItemValidation = [
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
];

/**
 * Validation for updating cart item quantity
 */
export const updateCartItemValidation = [
  param('id')
    .notEmpty()
    .withMessage('Cart item ID là bắt buộc')
    .isString()
    .withMessage('Cart item ID phải là chuỗi'),

  body('quantity')
    .notEmpty()
    .withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương (tối thiểu 1)'),
];

/**
 * Validation for removing cart item
 */
export const removeCartItemValidation = [
  param('id')
    .notEmpty()
    .withMessage('Cart item ID là bắt buộc')
    .isString()
    .withMessage('Cart item ID phải là chuỗi'),
];
