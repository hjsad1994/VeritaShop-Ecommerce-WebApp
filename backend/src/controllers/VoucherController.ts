import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '@constants';
import { VoucherDto } from '../dtos/VoucherDto';
import { VoucherStatus } from '../repositories/VoucherRepository';

export class VoucherController {
  private readonly voucherService = ServiceFactory.getVoucherService();

  getVouchers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, type, status, sortBy, sortOrder } = req.query;
      const result = await this.voucherService.getVouchers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search?.toString(),
        type: type?.toString() as any,
        status: status?.toString() as VoucherStatus,
        sortBy: sortBy?.toString() as any,
        sortOrder: sortOrder?.toString() as any,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_VOUCHERS_SUCCESS,
        data: {
          vouchers: VoucherDto.fromVoucherList(result.vouchers),
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucher = await this.voucherService.getVoucher(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_VOUCHER_SUCCESS,
        data: VoucherDto.fromVoucher(voucher),
      });
    } catch (error) {
      next(error);
    }
  };

  createVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucher = await this.voucherService.createVoucher(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_VOUCHER_SUCCESS,
        data: VoucherDto.fromVoucher(voucher),
      });
    } catch (error) {
      next(error);
    }
  };

  updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucher = await this.voucherService.updateVoucher(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_VOUCHER_SUCCESS,
        data: VoucherDto.fromVoucher(voucher),
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.voucherService.deleteVoucher(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_VOUCHER_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucher = await this.voucherService.toggleStatus(req.params.id, req.body.isActive);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_VOUCHER_SUCCESS,
        data: VoucherDto.fromVoucher(voucher),
      });
    } catch (error) {
      next(error);
    }
  };
}

