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
  brandId?: string; // Filter by brand
  includeArchived?: boolean; // Include archived variants
  status?: 'low' | 'out' | 'archived'; // Filter by status
  sort?: 'available' | 'updatedAt'; // Sort field
  page?: number;
  limit?: number;
}

export interface InventoryCatalogFilter {
  search?: string;
  brandId?: string;
  includeArchived?: boolean;
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
      brandId,
      includeArchived = false,
      status,
      sort = 'updatedAt',
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

    // Build variant filter object
    const variantFilter: Prisma.ProductVariantWhereInput = {};

    // Archived filter
    if (!includeArchived) {
      variantFilter.isActive = true;
    }

    // Brand filter
    if (brandId) {
      variantFilter.product = {
        brandId,
      };
    }

    // Search filter - can search in variant SKU or product name
    // If both brand and search are provided, combine them with AND
    if (search) {
      const searchCondition = {
        OR: [
          { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { product: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        ],
      };

      if (brandId) {
        // Both brand and search: use AND to combine
        variantFilter.AND = [
          { product: { brandId } },
          searchCondition,
        ];
        // Remove the product filter since we're using AND now
        delete variantFilter.product;
      } else {
        // Only search
        variantFilter.OR = searchCondition.OR;
      }
    }

    // Only add variant filter if we have any conditions
    if (Object.keys(variantFilter).length > 0) {
      where.variant = variantFilter;
    }

    // Get inventory records with enriched data
    let inventories = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: {
          include: {
            product: {
              include: {
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: sort === 'available' ? { available: 'asc' } : { updatedAt: 'desc' },
    });

    // Apply post-query filters that require column comparison
    if (lowStock || status === 'low') {
      inventories = inventories.filter(
        (inv) => inv.minStock > 0 && inv.available < inv.minStock
      );
    }

    if (status === 'out') {
      inventories = inventories.filter((inv) => inv.available <= 0);
    }

    if (status === 'archived') {
      inventories = inventories.filter((inv) => !inv.variant.isActive);
    }

    // Get last movement timestamps for each inventory
    const inventoryIds = inventories.map((inv) => inv.id);
    const lastMovements = await this.prisma.stockMovement.findMany({
      where: {
        inventoryId: { in: inventoryIds },
      },
      select: {
        inventoryId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['inventoryId'],
    });

    const lastMovementMap = new Map(
      lastMovements.map((m) => [m.inventoryId, m.createdAt])
    );

    // Enrich inventories with lastMovementAt
    const enrichedInventories = inventories.map((inv) => ({
      ...inv,
      lastMovementAt: lastMovementMap.get(inv.id) || null,
    }));

    // Calculate total and apply pagination
    const total = enrichedInventories.length;
    const paginatedInventories = enrichedInventories.slice(skip, skip + limit);

    return {
      inventories: paginatedInventories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all variants with inventory (including those without inventory records)
   */
  async findAllVariants(filter: InventoryFilter) {
    const {
      variantId,
      minAvailable,
      maxAvailable,
      lowStock,
      status,
      search,
      brandId,
      includeArchived = false,
      sort = 'updatedAt',
      page = 1,
      limit = 20,
    } = filter;

    const skip = (page - 1) * limit;

    // Build where clause for ProductVariant
    const where: Prisma.ProductVariantWhereInput = {};

    if (!includeArchived) {
      where.isActive = true;
    }

    // Brand filter (via Product)
    if (brandId) {
      where.product = {
        brandId,
      };
    }

    // Search filter (SKU or Product Name)
    if (search) {
      const searchCondition: Prisma.ProductVariantWhereInput = {
        OR: [
          { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { product: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        ],
      };

      if (brandId) {
        where.AND = [
          { product: { brandId } },
          searchCondition,
        ];
        delete where.product;
      } else {
        where.OR = searchCondition.OR;
      }
    }

    // Variant ID filter
    if (variantId) {
      where.id = variantId;
    }

    // Get all variants matching the base criteria
    // We fetch ALL to perform in-memory filtering for inventory status
    const variants = await this.prisma.productVariant.findMany({
      where,
      include: {
        product: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map variants to "Inventory-like" structure
    let enrichedInventories = variants.map((variant) => {
      const inventory = variant.inventory || {
        id: `virtual-${variant.id}`, // Virtual ID
        variantId: variant.id,
        quantity: 0,
        reserved: 0,
        available: 0,
        minStock: 0,
        maxStock: 0,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      };

      return {
        ...inventory,
        variant: {
          ...variant,
          inventory: undefined 
        },
      };
    });

    // Apply post-query filters
    if (minAvailable !== undefined) {
      enrichedInventories = enrichedInventories.filter(inv => inv.available >= minAvailable);
    }

    if (maxAvailable !== undefined) {
      enrichedInventories = enrichedInventories.filter(inv => inv.available <= maxAvailable);
    }

    if (lowStock || status === 'low') {
      enrichedInventories = enrichedInventories.filter(
        (inv) => inv.minStock > 0 && inv.available < inv.minStock
      );
    }

    if (status === 'out') {
      enrichedInventories = enrichedInventories.filter((inv) => inv.available <= 0);
    }

    if (status === 'archived') {
      enrichedInventories = enrichedInventories.filter((inv) => !inv.variant.isActive);
    }

    // Apply sorting
    if (sort === 'available') {
      enrichedInventories.sort((a, b) => a.available - b.available);
    } else {
      // Default sort by updatedAt desc (already roughly sorted by query, but let's ensure)
      enrichedInventories.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
    }

    // Pagination
    const total = enrichedInventories.length;
    const paginatedInventories = enrichedInventories.slice(skip, skip + limit);

    return {
      inventories: paginatedInventories,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /**
   * Fetch catalog summary combining products, variants, and inventory stats
   */
  async getCatalogSummary(filter: InventoryCatalogFilter) {
    const {
      search,
      brandId,
      includeArchived = false,
      page = 1,
      limit = 12,
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (!includeArchived) {
      where.isActive = true;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          variants: {
            some: {
              OR: [
                { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { color: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { storage: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { ram: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            },
          },
        },
      ];
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            orderBy: { createdAt: 'desc' },
            include: {
              inventory: true,
            },
          },
        },
      }),
    ]);

    const filteredProducts = products.map((product) => ({
      ...product,
      variants: includeArchived
        ? product.variants
        : product.variants.filter((variant) => variant.isActive),
    }));

    return {
      products: filteredProducts,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
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
      // Using raw query since Prisma doesn't support column comparison
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::int as count
        FROM "Inventory"
        WHERE "available" < "minStock" AND "minStock" > 0
      `.then((result) => Number(result[0].count)),

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
    // Get all inventory and filter in memory since Prisma doesn't support column comparison
    const allInventory = await this.prisma.inventory.findMany({
      where: {
        minStock: { gt: 0 },
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
      orderBy: {
        available: 'asc',
      },
    });

    // Filter items where available < minStock
    return allInventory
      .filter((inv) => inv.available < inv.minStock)
      .slice(0, limit);
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
