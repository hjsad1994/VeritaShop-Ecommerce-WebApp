import { body, ValidationChain } from 'express-validator';

const SKU_PATTERN = /^[A-Z0-9_-]+$/;
const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const sharedRules = (options?: { optional?: boolean }): ValidationChain[] => {
  const isOptional = options?.optional ?? false;

  const colorRule = isOptional ? body('color').optional() : body('color').notEmpty().withMessage('Color is required');
  const priceRule = isOptional ? body('price').optional() : body('price').notEmpty().withMessage('Price is required');
  const skuRule = isOptional ? body('sku').optional() : body('sku').notEmpty().withMessage('SKU is required');

  return [
    colorRule
      .isLength({ min: 2, max: 50 })
      .withMessage('Color must be between 2 and 50 characters'),

    body('colorCode')
      .optional({ values: 'falsy' })
      .isString()
      .bail()
      .matches(HEX_COLOR_PATTERN)
      .withMessage('Color code must be a valid hex value'),

    body('storage')
      .optional({ values: 'falsy' })
      .isLength({ min: 1, max: 50 })
      .withMessage('Storage must be between 1 and 50 characters'),

    body('ram')
      .optional({ values: 'falsy' })
      .isLength({ min: 1, max: 50 })
      .withMessage('RAM must be between 1 and 50 characters'),

    priceRule
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),

    body('comparePrice')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Compare price must be greater than 0'),

    skuRule
      // .matches(SKU_PATTERN)
      // .withMessage('SKU must be uppercase and can only include letters, numbers, hyphen, underscore')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('SKU must be between 1 and 100 characters'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),

    body('images')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Images must be an array with at most 5 items'),

    body('images.*.s3Key')
      .optional()
      .isString()
      .withMessage('Image s3Key is required for each image'),

    body('images.*.altText')
      .optional({ values: 'falsy' })
      .isLength({ max: 120 })
      .withMessage('Image alt text must be at most 120 characters'),

    body('images.*.isPrimary')
      .optional()
      .isBoolean()
      .withMessage('Image isPrimary must be boolean'),

    body('inventory')
      .optional()
      .isObject()
      .withMessage('Inventory must be an object'),

    body('inventory.quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Inventory quantity must be >= 0'),

    body('inventory.minStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Inventory minStock must be >= 0'),

    body('inventory.maxStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Inventory maxStock must be >= 0'),
  ];
};

export class VariantValidation {
  static create(): ValidationChain[] {
    return sharedRules();
  }

  static update(): ValidationChain[] {
    return [
      ...sharedRules({ optional: true }),
      body('imageIdsToDelete')
        .optional()
        .isArray()
        .withMessage('imageIdsToDelete must be an array of ids'),
      body('imageIdsToDelete.*').optional().isString().withMessage('Image id must be string'),
      body('existingImages')
        .optional()
        .isArray()
        .withMessage('existingImages must be an array'),
      body('existingImages.*.id').optional().isString().withMessage('existingImages.id is required'),
      body('existingImages.*.isPrimary')
        .optional()
        .isBoolean()
        .withMessage('existingImages.isPrimary must be boolean'),
      body('existingImages.*.sortOrder')
        .optional()
        .isInt()
        .withMessage('existingImages.sortOrder must be an integer'),
    ];
  }
}

