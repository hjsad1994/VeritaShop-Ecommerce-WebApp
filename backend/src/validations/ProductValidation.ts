import { body, query, ValidationChain } from 'express-validator';

export class ProductValidation {
  static queryProducts(): ValidationChain[] {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('brand')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Brand slug must be between 1 and 50 characters'),
      
      query('category')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category slug must be between 1 and 50 characters'),
      
      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Min price must be a positive number'),
      
      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Max price must be a positive number'),
      
      query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
      
      query('sort')
        .optional()
        .isIn(['price_asc', 'price_desc', 'newest', 'popular', 'name_asc', 'name_desc'])
        .withMessage('Sort must be one of: price_asc, price_desc, newest, popular, name_asc, name_desc'),
    ];
  }

  static queryLimit(): ValidationChain[] {
    return [
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    ];
  }

  static create(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),
      
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
      
      body('brandId')
        .notEmpty()
        .withMessage('Brand ID is required')
        .isString()
        .withMessage('Brand ID must be a string'),
      
      body('categoryId')
        .notEmpty()
        .withMessage('Category ID is required')
        .isString()
        .withMessage('Category ID must be a string'),
      
      body('basePrice')
        .notEmpty()
        .withMessage('Base price is required')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),
      
      body('discount')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be between 0 and 100'),
      
      body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean'),
      
      body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    ];
  }

  static update(): ValidationChain[] {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),
      
      body('slug')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Description must not exceed 5000 characters'),
      
      body('brandId')
        .optional()
        .isString()
        .withMessage('Brand ID must be a string'),
      
      body('categoryId')
        .optional()
        .isString()
        .withMessage('Category ID must be a string'),
      
      body('basePrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),
      
      body('discount')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Discount must be between 0 and 100'),
      
      body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean'),
      
      body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    ];
  }
}
