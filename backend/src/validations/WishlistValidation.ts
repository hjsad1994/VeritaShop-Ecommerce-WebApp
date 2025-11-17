import { body, param } from 'express-validator';

/**
 * Validation for adding product to wishlist
 */
export const addWishlistItemValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID là bắt buộc')
    .isString()
    .withMessage('Product ID phải là chuỗi'),
];

/**
 * Validation for removing wishlist item
 */
export const removeWishlistItemValidation = [
  param('id')
    .notEmpty()
    .withMessage('Wishlist item ID là bắt buộc')
    .isString()
    .withMessage('Wishlist item ID phải là chuỗi'),
];
