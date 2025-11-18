import { Voucher } from '@prisma/client';
import { VoucherStatus } from '../repositories/VoucherRepository';

export interface VoucherResponse extends Voucher {
  status: VoucherStatus;
  isExpired: boolean;
  isScheduled: boolean;
}

export class VoucherDto {
  static fromVoucher(voucher: Voucher): VoucherResponse {
    const now = new Date();
    const hasStarted = !voucher.startDate || voucher.startDate <= now;
    const hasEnded = voucher.endDate ? voucher.endDate < now : false;

    let status: VoucherStatus = 'inactive';
    if (!voucher.isActive) {
      status = 'inactive';
    } else if (hasEnded) {
      status = 'expired';
    } else if (!hasStarted) {
      status = 'scheduled';
    } else {
      status = 'active';
    }

    return {
      ...voucher,
      status,
      isExpired: status === 'expired',
      isScheduled: status === 'scheduled',
    };
  }

  static fromVoucherList(vouchers: Voucher[]): VoucherResponse[] {
    return vouchers.map(VoucherDto.fromVoucher);
  }
}

