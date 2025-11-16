import { body, query, ValidationChain } from 'express-validator';

export class BrandValidation {
  /**
   * Validation cho query parameters khi lấy danh sách brands
   */
  static queryBrands(): ValidationChain[] {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    ];
  }

  /**
   * Validation cho tạo brand mới
   */
  static create(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Brand name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Brand name must be between 2 and 100 characters'),
      
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
      
      body('logo')
        .optional()
        .trim()
        .isURL()
        .withMessage('Logo must be a valid URL'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
      
      body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    ];
  }

  /**
   * Validation cho cập nhật brand
   */
  static update(): ValidationChain[] {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Brand name must be between 2 and 100 characters'),
      
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
      
      body('logo')
        .optional()
        .trim()
        .isURL()
        .withMessage('Logo must be a valid URL'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
      
      body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    ];
  }

  /**
   * Validation cho query products của brand
   */
  static queryBrandProducts(): ValidationChain[] {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('sort')
        .optional()
        .isIn(['price_asc', 'price_desc', 'newest', 'popular', 'name_asc', 'name_desc'])
        .withMessage('Sort must be one of: price_asc, price_desc, newest, popular, name_asc, name_desc'),
    ];
  }
}
