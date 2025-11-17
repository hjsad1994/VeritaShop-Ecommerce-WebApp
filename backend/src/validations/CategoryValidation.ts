import { body, query } from 'express-validator';

export class CategoryValidation {
    /**
     * Validation for query parameters (GET /api/categories)
     */
    static queryCategories() {
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
                .isString()
                .trim()
                .isLength({ min: 1, max: 100 })
                .withMessage('Search must be between 1 and 100 characters'),
            query('includeChildren')
                .optional()
                .isBoolean()
                .withMessage('includeChildren must be a boolean')
        ];
    }

    /**
     * Validation for creating category (POST /api/categories)
     */
    static create() {
        return [
            body('name')
                .notEmpty()
                .withMessage('Category name is required')
                .isString()
                .withMessage('Category name must be a string')
                .trim()
                .isLength({ min: 2, max: 100 })
                .withMessage('Category name must be between 2 and 100 characters'),
            body('description')
                .optional()
                .isString()
                .withMessage('Description must be a string')
                .trim()
                .isLength({ max: 500 })
                .withMessage('Description must not exceed 500 characters'),
            body('image')
                .optional()
                .isString()
                .withMessage('Image must be a string')
                .trim()
                .isURL()
                .withMessage('Image must be a valid URL'),
            body('parentId')
                .optional()
                .isString()
                .withMessage('Parent ID must be a string')
                .trim()
                .notEmpty()
                .withMessage('Parent ID cannot be empty if provided')
        ];
    }

    /**
     * Validation for updating category (PUT /api/categories/:id)
     */
    static update() {
        return [
            body('name')
                .optional()
                .isString()
                .withMessage('Category name must be a string')
                .trim()
                .isLength({ min: 2, max: 100 })
                .withMessage('Category name must be between 2 and 100 characters'),
            body('description')
                .optional()
                .isString()
                .withMessage('Description must be a string')
                .trim()
                .isLength({ max: 500 })
                .withMessage('Description must not exceed 500 characters'),
            body('image')
                .optional()
                .isString()
                .withMessage('Image must be a string')
                .trim()
                .isURL()
                .withMessage('Image must be a valid URL'),
            body('parentId')
                .optional()
                .custom((value) => {
                    // Allow null or valid string
                    if (value === null || (typeof value === 'string' && value.trim().length > 0)) {
                        return true;
                    }
                    throw new Error('Parent ID must be null or a non-empty string');
                }),
            body('isActive')
                .optional()
                .isBoolean()
                .withMessage('isActive must be a boolean')
        ];
    }
}
