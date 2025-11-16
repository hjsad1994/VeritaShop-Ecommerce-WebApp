import { body, ValidationChain } from 'express-validator';

export class UserValidation {
    static update(): ValidationChain[] {
        return [
            body('name')
                .optional()
                .trim()
                .isLength({ min: 2, max: 30 })
                .withMessage('Name must be between 2 and 30 characters'),
            body('phone')
                .optional()
                .isLength({ min: 10, max: 11 })
                .withMessage('Phone number must be between 10 and 11 characters'),
            body('address')
                .optional()
                .trim()
                .isLength({ min: 2, max: 100 })
                .withMessage('Address must be between 2 and 100 characters'),
            body('avatar')
                .optional()
                .trim()
                .isURL()
                .withMessage('Avatar must be a valid URL'),
        ];
    }
}
