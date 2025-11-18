import { Voucher, VoucherType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES, VOUCHER_CONSTANTS } from '@constants';
import {
  CreateVoucherData,
  UpdateVoucherData,
  VoucherQueryOptions,
  VoucherRepository,
} from '../repositories/VoucherRepository';

export interface VoucherListResponse {
  vouchers: Voucher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class VoucherService {
  constructor(private readonly voucherRepository: VoucherRepository) {}

  async getVouchers(options: VoucherQueryOptions): Promise<VoucherListResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const { vouchers, total } = await this.voucherRepository.findAll({
      ...options,
      page,
      limit,
    });

    return {
      vouchers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getVoucher(id: string): Promise<Voucher> {
    const voucher = await this.voucherRepository.findById(id);
    if (!voucher) {
      throw new ApiError(404, ERROR_MESSAGES.VOUCHER_NOT_FOUND);
    }
    return voucher;
  }

  async createVoucher(payload: CreateVoucherData): Promise<Voucher> {
    await this.ensureCodeUnique(payload.code);
    this.validateValue(payload.type, Number(payload.value));
    this.validateUsageLimits(payload.usageLimit, payload.perUserLimit);
    this.validateDateRange(payload.startDate, payload.endDate);

    try {
      const voucher = await this.voucherRepository.create({
        ...payload,
        code: payload.code.toUpperCase(),
        isActive: payload.isActive ?? true,
      });
      logger.info(`[Voucher] Created voucher ${voucher.code}`);
      return voucher;
    } catch (error) {
      logger.error('[Voucher] Failed to create voucher', error);
      throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  async updateVoucher(id: string, payload: UpdateVoucherData): Promise<Voucher> {
    const existing = await this.getVoucher(id);

    if (payload.code) {
      await this.ensureCodeUnique(payload.code, id);
    }

    if (payload.type || payload.value) {
      const type = payload.type ?? existing.type;
      const value = payload.value ?? existing.value;
      this.validateValue(type, Number(value));
    }

    if (payload.usageLimit !== undefined || payload.perUserLimit !== undefined) {
      this.validateUsageLimits(payload.usageLimit, payload.perUserLimit);
    }

    if (payload.startDate !== undefined || payload.endDate !== undefined) {
      this.validateDateRange(
        payload.startDate ?? existing.startDate ?? undefined,
        payload.endDate ?? existing.endDate ?? undefined,
      );
    }

    try {
      const voucher = await this.voucherRepository.update(id, {
        ...payload,
        code: payload.code?.toUpperCase(),
      });
      logger.info(`[Voucher] Updated voucher ${voucher.code}`);
      return voucher;
    } catch (error) {
      logger.error('[Voucher] Failed to update voucher', error);
      throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  async deleteVoucher(id: string): Promise<void> {
    await this.getVoucher(id);
    try {
      await this.voucherRepository.delete(id);
      logger.info(`[Voucher] Deleted voucher ${id}`);
    } catch (error) {
      logger.error('[Voucher] Failed to delete voucher', error);
      throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Voucher> {
    await this.getVoucher(id);
    return this.voucherRepository.update(id, { isActive });
  }

  private async ensureCodeUnique(code: string, excludeId?: string) {
    const exists = await this.voucherRepository.existsByCode(code, excludeId);
    if (exists) {
      throw new ApiError(409, ERROR_MESSAGES.VOUCHER_CODE_EXISTS);
    }
  }

  private validateValue(type: VoucherType, value: number) {
    if (type === VoucherType.PERCENTAGE) {
      if (value < VOUCHER_CONSTANTS.VALUE.MIN_PERCENT || value > VOUCHER_CONSTANTS.VALUE.MAX_PERCENT) {
        throw new ApiError(400, ERROR_MESSAGES.VOUCHER_VALUE_INVALID);
      }
    } else if (type === VoucherType.FIXED) {
      if (value < VOUCHER_CONSTANTS.VALUE.MIN_FIXED || value > VOUCHER_CONSTANTS.VALUE.MAX_FIXED) {
        throw new ApiError(400, ERROR_MESSAGES.VOUCHER_VALUE_INVALID);
      }
    }
  }

  private validateUsageLimits(usageLimit?: number | null, perUserLimit?: number | null) {
    const { MIN, MAX } = VOUCHER_CONSTANTS.LIMITS;
    if (usageLimit !== undefined && usageLimit !== null) {
      if (usageLimit < MIN || usageLimit > MAX) {
        throw new ApiError(400, ERROR_MESSAGES.VOUCHER_LIMIT_INVALID);
      }
    }
    if (perUserLimit !== undefined && perUserLimit !== null) {
      if (perUserLimit < MIN || perUserLimit > MAX) {
        throw new ApiError(400, ERROR_MESSAGES.VOUCHER_LIMIT_INVALID);
      }
    }
  }

  private validateDateRange(startDate?: Date | null, endDate?: Date | null) {
    if (startDate && endDate && startDate > endDate) {
      throw new ApiError(400, ERROR_MESSAGES.VOUCHER_DATE_INVALID);
    }
  }
}

