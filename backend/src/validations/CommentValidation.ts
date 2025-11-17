import { body, query, ValidationChain } from 'express-validator';

/**
 * CommentValidation - Validation schemas for Comment endpoints
 * Uses express-validator for input validation
 */
export class CommentValidation {
  /**
   * Validation for GET /api/comments query parameters
   */
  static queryComments(): ValidationChain[] {
    return [
      query('productId')
        .optional()
        .isString()
        .withMessage('Product ID phải là chuỗi')
        .trim(),

      query('userId')
        .optional()
        .isString()
        .withMessage('User ID phải là chuỗi')
        .trim(),

      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page phải là số nguyên dương')
        .toInt(),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit phải từ 1 đến 100')
        .toInt(),

      query('sortBy')
        .optional()
        .isIn(['newest', 'oldest'])
        .withMessage('sortBy phải là "newest" hoặc "oldest"'),
    ];
  }

  /**
   * Validation for POST /api/comments
   */
  static create(): ValidationChain[] {
    return [
      body('productId')
        .notEmpty()
        .withMessage('Product ID là bắt buộc')
        .isString()
        .withMessage('Product ID phải là chuỗi')
        .trim(),

      body('content')
        .notEmpty()
        .withMessage('Nội dung là bắt buộc')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Nội dung phải từ 1 đến 1000 ký tự'),

      body('parentId')
        .optional()
        .isString()
        .withMessage('Parent ID phải là chuỗi')
        .trim(),
    ];
  }

  /**
   * Validation for PUT /api/comments/:id
   */
  static update(): ValidationChain[] {
    return [
      body('content')
        .notEmpty()
        .withMessage('Nội dung là bắt buộc')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Nội dung phải từ 1 đến 1000 ký tự'),
    ];
  }
}
