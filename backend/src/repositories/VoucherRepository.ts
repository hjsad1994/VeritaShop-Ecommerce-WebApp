import { Prisma, PrismaClient, Voucher, VoucherType } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export type VoucherStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

export interface VoucherQueryOptions {
  search?: string;
  type?: VoucherType;
  status?: VoucherStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'value' | 'usageCount' | 'startDate' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVoucherData {
  code: string;
  type: VoucherType;
  value: Prisma.Decimal | number;
  minOrderValue?: Prisma.Decimal | number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export type UpdateVoucherData = Partial<CreateVoucherData> & {
  usageCount?: number;
};

export class VoucherRepository extends BaseRepository<Voucher> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findAll(options: VoucherQueryOptions = {}): Promise<{ vouchers: Voucher[]; total: number }> {
    const {
      search,
      type,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: Prisma.VoucherWhereInput = {};
    const andConditions: Prisma.VoucherWhereInput[] = [];
    const now = new Date();

    if (search) {
      where.OR = [
        { code: { contains: search.toUpperCase(), mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      switch (status) {
        case 'active':
          andConditions.push(
            { isActive: true },
            {
              OR: [
                { startDate: null },
                { startDate: { lte: now } },
              ],
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } },
              ],
            },
          );
          break;
        case 'inactive':
          andConditions.push({ isActive: false });
          break;
        case 'scheduled':
          andConditions.push(
            { isActive: true },
            { startDate: { gt: now } },
          );
          break;
        case 'expired':
          andConditions.push(
            { isActive: true },
            { endDate: { lt: now } },
          );
          break;
        default:
          break;
      }
    }

    if (andConditions.length) {
      where.AND = andConditions;
    }

    const skip = (page - 1) * limit;
    const [total, vouchers] = await this.prisma.$transaction([
      this.prisma.voucher.count({ where }),
      this.prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return { vouchers, total };
  }

  async findById(idOrCode: string): Promise<Voucher | null> {
    return this.prisma.voucher.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode.toUpperCase() }],
      },
    });
  }

  async create(data: CreateVoucherData): Promise<Voucher> {
    return this.prisma.voucher.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        minOrderValue: data.minOrderValue ?? 0,
      },
    });
  }

  async update(id: string, data: UpdateVoucherData): Promise<Voucher> {
    return this.prisma.voucher.update({
      where: { id },
      data: {
        ...data,
        ...(data.code && { code: data.code.toUpperCase() }),
      },
    });
  }

  async delete(id: string): Promise<Voucher> {
    return this.prisma.voucher.delete({
      where: { id },
    });
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code: code.toUpperCase(),
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });
    return Boolean(voucher);
  }
}

