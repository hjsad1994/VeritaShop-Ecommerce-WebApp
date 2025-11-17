import { Prisma, PrismaClient, StockMovementType } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export interface InventoryWithRelations {
  id: string;
  variantId: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  createdAt: Date;
  updatedAt: Date;
  variant?: any;
  movements?: any[];
}

export interface InventoryFilter {
  variantId?: string;
  minAvailable?: number;
  maxAvailable?: number;
  lowStock?: boolean; // available < minStock
  search?: string; // Search by product name, SKU
  page?: number;
  limit?: number;
}

export interface StockMovementFilter {
  variantId?: string;
  type?: StockMovementType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class InventoryRepository extends BaseRepository<any> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  /**
   * Find inventory by variant ID
   */
  async findByVariantId(variantId: string): Promise<InventoryWithRelations | null> {
    return await this.prisma.inventory.findUnique({
      where: { variantId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create or get inventory for a variant
   */
  async getOrCreateInventory(variantId: string, initialStock: number = 0): Promise<InventoryWithRelations> {
    let inventory = await this.findByVariantId(variantId);

    if (!inventory) {
      inventory = await this.prisma.inventory.create({
        data: {
          variantId,
          quantity: initialStock,
          available: initialStock,
          reserved: 0,
          minStock: 0,
          maxStock: 0,
        },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
    }

    return inventory;
  }

  /**
   * Get all inventory with filters and pagination
   */
  async findAll(filter: InventoryFilter) {
    const {
      variantId,
      minAvailable,
      maxAvailable,
      lowStock,
      search,
      page = 1,
      limit = 20,
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.InventoryWhereInput = {};

    if (variantId) {
      where.variantId = variantId;
    }

    if (minAvailable !== undefined || maxAvailable !== undefined) {
      where.available = {};
      if (minAvailable !== undefined) {
        where.available.gte = minAvailable;
      }
      if (maxAvailable !== undefined) {
        where.available.lte = maxAvailable;
      }
    }

    if (lowStock) {
      where.available = { lt: this.prisma.inventory.fields.minStock };
    }

    if (search) {
      where.variant = {
        OR: [
          { sku: { contains: search, mode: 'insensitive' } },
          { product: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    // Get total count
    const total = await this.prisma.inventory.count({ where });

    // Get inventory records
    const inventories = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brandId: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      inventories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update inventory quantity (used internally by service)
   */
  async updateInventory(
    inventoryId: string,
    data: { quantity?: number; reserved?: number; available?: number }
  ) {
    return await this.prisma.inventory.update({
      where: { id: inventoryId },
      data,
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Update stock thresholds (minStock, maxStock)
   */
  async updateStockThresholds(
    inventoryId: string,
    minStock: number,
    maxStock: number
  ) {
    return await this.prisma.inventory.update({
      where: { id: inventoryId },
      data: { minStock, maxStock },
    });
  }

  /**
   * Create stock movement record
   */
  async createStockMovement(data: {
    inventoryId: string;
    variantId: string;
    type: StockMovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    referenceId?: string;
    userId?: string;
  }) {
    return await this.prisma.stockMovement.create({
      data,
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get stock movement history with filters
   */
  async getStockMovements(filter: StockMovementFilter) {
    const {
      variantId,
      type,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.StockMovementWhereInput = {};

    if (variantId) {
      where.variantId = variantId;
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total count
    const total = await this.prisma.stockMovement.count({ where });

    // Get movements
    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      movements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats() {
    const [totalInventory, totalQuantity, lowStockCount, outOfStockCount] = await Promise.all([
      // Total inventory records
      this.prisma.inventory.count(),

      // Total quantity across all variants
      this.prisma.inventory.aggregate({
        _sum: {
          quantity: true,
          available: true,
          reserved: true,
        },
      }),

      // Low stock count (available < minStock and minStock > 0)
      this.prisma.inventory.count({
        where: {
          AND: [
            { available: { lt: this.prisma.inventory.fields.minStock } },
            { minStock: { gt: 0 } },
          ],
        },
      }),

      // Out of stock count
      this.prisma.inventory.count({
        where: {
          available: { lte: 0 },
        },
      }),
    ]);

    return {
      totalInventory,
      totalQuantity: totalQuantity._sum.quantity || 0,
      totalAvailable: totalQuantity._sum.available || 0,
      totalReserved: totalQuantity._sum.reserved || 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(limit: number = 20) {
    return await this.prisma.inventory.findMany({
      where: {
        AND: [
          { available: { lt: this.prisma.inventory.fields.minStock } },
          { minStock: { gt: 0 } },
        ],
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      take: limit,
      orderBy: {
        available: 'asc',
      },
    });
  }

  /**
   * Reserve stock for an order (used when order is placed)
   */
  async reserveStock(variantId: string, quantity: number) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.available < quantity) {
      throw new Error('Insufficient stock available');
    }

    return await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: { increment: quantity },
        available: { decrement: quantity },
      },
    });
  }

  /**
   * Release reserved stock (when order is cancelled)
   */
  async releaseReservedStock(variantId: string, quantity: number) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    return await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: { decrement: quantity },
        available: { increment: quantity },
      },
    });
  }

  /**
   * Confirm stock deduction (when order is completed)
   */
  async confirmStockDeduction(variantId: string, quantity: number) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    return await this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: { decrement: quantity },
        reserved: { decrement: quantity },
      },
    });
  }
}
