import { body, query, ValidationChain } from 'express-validator';

/**
 * ReviewValidation - Validation schemas for Review endpoints
 */
export class ReviewValidation {
  /**
   * Validation for querying reviews
   */
  static queryReviews(): ValidationChain[] {
    return [
      query('productId')
        .optional()
        .isString()
        .withMessage('Product ID phải là chuỗi'),

      query('userId')
        .optional()
        .isString()
        .withMessage('User ID phải là chuỗi'),

      query('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating phải từ 1 đến 5'),

      query('isVerified')
        .optional()
        .isBoolean()
        .withMessage('isVerified phải là boolean'),

      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page phải là số nguyên dương'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit phải từ 1 đến 100'),

      query('sortBy')
        .optional()
        .isIn(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful'])
        .withMessage('sortBy không hợp lệ'),
    ];
  }

  /**
   * Validation for creating a review
   */
  static create(): ValidationChain[] {
    return [
      body('productId')
        .notEmpty()
        .withMessage('Product ID là bắt buộc')
        .isString()
        .withMessage('Product ID phải là chuỗi'),

      body('rating')
        .notEmpty()
        .withMessage('Rating là bắt buộc')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating phải từ 1 đến 5 sao'),

      body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Tiêu đề phải từ 1 đến 200 ký tự'),

      body('content')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Nội dung phải từ 10 đến 2000 ký tự'),

      body('images')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Tối đa 5 ảnh'),

      body('images.*')
        .optional()
        .isURL()
        .withMessage('Mỗi ảnh phải là URL hợp lệ'),
    ];
  }

  /**
   * Validation for updating a review
   */
  static update(): ValidationChain[] {
    return [
      body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating phải từ 1 đến 5 sao'),

      body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Tiêu đề phải từ 1 đến 200 ký tự'),

      body('content')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Nội dung phải từ 10 đến 2000 ký tự'),
    ];
  }

  /**
   * Validation for adding an image to a review
   */
  static addImage(): ValidationChain[] {
    return [
      body('imageUrl')
        .notEmpty()
        .withMessage('Image URL là bắt buộc')
        .isURL()
        .withMessage('Image URL phải là URL hợp lệ'),
    ];
  }

  /**
   * Validation for creating a review response
   */
  static createResponse(): ValidationChain[] {
    return [
      body('content')
        .notEmpty()
        .withMessage('Nội dung phản hồi là bắt buộc')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Nội dung phải từ 10 đến 1000 ký tự'),
    ];
  }

  /**
   * Validation for updating a review response
   */
  static updateResponse(): ValidationChain[] {
    return [
      body('content')
        .notEmpty()
        .withMessage('Nội dung phản hồi là bắt buộc')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Nội dung phải từ 10 đến 1000 ký tự'),
    ];
  }
}
