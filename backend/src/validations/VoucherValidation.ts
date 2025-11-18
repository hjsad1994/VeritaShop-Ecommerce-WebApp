import { body, query, ValidationChain } from 'express-validator';
import { VoucherType } from '@prisma/client';
import { VOUCHER_CONSTANTS } from '@constants';

const voucherTypes = Object.values(VoucherType);

const sharedRules = (): ValidationChain[] => [
  body('minOrderValue')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Giá trị đơn hàng tối thiểu không hợp lệ'),
  body('usageLimit')
    .optional({ nullable: true })
    .isInt({ min: VOUCHER_CONSTANTS.LIMITS.MIN, max: VOUCHER_CONSTANTS.LIMITS.MAX })
    .withMessage('Giới hạn tổng không hợp lệ'),
  body('perUserLimit')
    .optional({ nullable: true })
    .isInt({ min: VOUCHER_CONSTANTS.LIMITS.MIN, max: VOUCHER_CONSTANTS.LIMITS.MAX })
    .withMessage('Giới hạn mỗi người dùng không hợp lệ'),
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là boolean')
    .toBoolean(),
];

export class VoucherValidation {
  static list(): ValidationChain[] {
    return [
      query('page').optional().isInt({ min: 1 }).withMessage('Page phải lớn hơn 0'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit nằm trong khoảng 1-100'),
      query('status')
        .optional()
        .isIn(['active', 'inactive', 'scheduled', 'expired'])
        .withMessage('Status không hợp lệ'),
      query('type')
        .optional()
        .isIn(voucherTypes)
        .withMessage('Loại voucher không hợp lệ'),
      query('sortBy')
        .optional()
        .isIn(['createdAt', 'value', 'usageCount', 'startDate', 'endDate'])
        .withMessage('sortBy không hợp lệ'),
      query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('sortOrder không hợp lệ'),
    ];
  }

  static create(): ValidationChain[] {
    return [
      body('code')
        .notEmpty()
        .withMessage('Code là bắt buộc')
        .isLength({ min: VOUCHER_CONSTANTS.CODE.MIN_LENGTH, max: VOUCHER_CONSTANTS.CODE.MAX_LENGTH })
        .matches(VOUCHER_CONSTANTS.CODE.PATTERN)
        .toUpperCase(),
      body('type')
        .notEmpty()
        .withMessage('Loại voucher là bắt buộc')
        .isIn(voucherTypes),
      body('value')
        .notEmpty()
        .withMessage('Giá trị voucher là bắt buộc')
        .isFloat({ gt: 0 }),
      ...sharedRules(),
    ];
  }

  static update(): ValidationChain[] {
    return [
      body('code')
        .optional({ nullable: true })
        .isLength({ min: VOUCHER_CONSTANTS.CODE.MIN_LENGTH, max: VOUCHER_CONSTANTS.CODE.MAX_LENGTH })
        .withMessage(`Code dài từ ${VOUCHER_CONSTANTS.CODE.MIN_LENGTH}-${VOUCHER_CONSTANTS.CODE.MAX_LENGTH} ký tự`)
        .matches(VOUCHER_CONSTANTS.CODE.PATTERN)
        .withMessage('Code chỉ gồm A-Z, 0-9, _ hoặc -')
        .toUpperCase(),
      body('type')
        .optional()
        .isIn(voucherTypes)
        .withMessage('Loại voucher không hợp lệ'),
      body('value')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Giá trị voucher phải lớn hơn 0'),
      ...sharedRules(),
    ];
  }

  static toggle(): ValidationChain[] {
    return [
      body('isActive').isBoolean().withMessage('isActive phải là boolean').toBoolean(),
    ];
  }
}

