import { body, ValidationChain } from 'express-validator';

const roleValues = ['USER', 'ADMIN', 'MANAGER'];

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

    static adminCreate(): ValidationChain[] {
        return [
            body('email').isEmail().withMessage('Email không hợp lệ'),
            body('password').isLength({ min: 6 }).withMessage('Password phải có tối thiểu 6 ký tự'),
            body('name')
                .optional()
                .trim()
                .isLength({ min: 2, max: 50 })
                .withMessage('Tên phải từ 2-50 ký tự'),
            body('role')
                .optional()
                .isIn(roleValues)
                .withMessage('Role không hợp lệ'),
            body('phone')
                .optional()
                .isLength({ min: 10, max: 11 })
                .withMessage('Số điện thoại phải từ 10-11 ký tự'),
            body('address')
                .optional()
                .trim()
                .isLength({ min: 2, max: 100 })
                .withMessage('Địa chỉ phải từ 2-100 ký tự'),
            body('avatar')
                .optional()
                .trim()
                .isURL()
                .withMessage('Avatar phải là URL hợp lệ'),
            body('isActive')
                .optional()
                .isBoolean()
                .withMessage('Trạng thái không hợp lệ')
                .toBoolean(),
        ];
    }

    static adminUpdate(): ValidationChain[] {
        return [
            body('email')
                .optional()
                .isEmail()
                .withMessage('Email không hợp lệ'),
            body('password')
                .optional()
                .isLength({ min: 6 })
                .withMessage('Password phải có tối thiểu 6 ký tự'),
            body('name')
                .optional()
                .trim()
                .isLength({ min: 2, max: 50 })
                .withMessage('Tên phải từ 2-50 ký tự'),
            body('role')
                .optional()
                .isIn(roleValues)
                .withMessage('Role không hợp lệ'),
            body('phone')
                .optional()
                .isLength({ min: 10, max: 11 })
                .withMessage('Số điện thoại phải từ 10-11 ký tự'),
            body('address')
                .optional()
                .trim()
                .isLength({ min: 2, max: 100 })
                .withMessage('Địa chỉ phải từ 2-100 ký tự'),
            body('avatar')
                .optional()
                .trim()
                .isURL()
                .withMessage('Avatar phải là URL hợp lệ'),
            body('isActive')
                .optional()
                .isBoolean()
                .withMessage('Trạng thái không hợp lệ')
                .toBoolean(),
        ];
    }
}
