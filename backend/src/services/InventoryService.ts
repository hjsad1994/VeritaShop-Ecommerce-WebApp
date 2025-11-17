import { StockMovementType } from '@prisma/client';
import { InventoryRepository, InventoryFilter, StockMovementFilter } from '../repositories/InventoryRepository';
import { RepositoryFactory } from '../repositories';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import { PrismaClient } from '@prisma/client';

export interface StockInData {
  variantId: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId: string;
}

export interface StockOutData {
  variantId: string;
  quantity: number;
  reason?: string;
  referenceId?: string;
  userId: string;
}

export interface StockAdjustmentData {
  variantId: string;
  newQuantity: number;
  reason: string;
  userId: string;
}

export class InventoryService {
  private inventoryRepository: InventoryRepository;
  private productRepository: any;
  private prisma: PrismaClient;

  constructor() {
    this.inventoryRepository = RepositoryFactory.getInventoryRepository();
    this.productRepository = RepositoryFactory.getProductRepository();
    this.prisma = RepositoryFactory.getPrisma();
  }

  /**
   * Get all inventory with filters and pagination
   */
  async getAllInventory(filter: InventoryFilter) {
    const result = await this.inventoryRepository.findAll(filter);

    return {
      inventories: result.inventories,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get inventory by variant ID
   */
  async getInventoryByVariantId(variantId: string) {
    // Validate variant exists
    const variant = await this.productRepository.findVariantById(variantId);
    if (!variant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VARIANT_NOT_FOUND);
    }

    // Get or create inventory for this variant
    const inventory = await this.inventoryRepository.getOrCreateInventory(variantId);

    // Check if low stock
    const isLowStock = inventory.minStock > 0 && inventory.available < inventory.minStock;
    const isOutOfStock = inventory.available <= 0;

    return {
      ...inventory,
      isLowStock,
      isOutOfStock,
    };
  }

  /**
   * Stock In (Nhập kho)
   */
  async stockIn(data: StockInData) {
    const { variantId, quantity, reason, referenceId, userId } = data;

    // Validate quantity
    if (quantity <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY);
    }

    // Validate variant exists
    const variant = await this.productRepository.findVariantById(variantId);
    if (!variant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VARIANT_NOT_FOUND);
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Get or create inventory
      let inventory = await tx.inventory.findUnique({
        where: { variantId },
      });

      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            variantId,
            quantity: 0,
            reserved: 0,
            available: 0,
            minStock: 0,
            maxStock: 0,
          },
        });
      }

      const previousStock = inventory.quantity;
      const newStock = previousStock + quantity;

      // Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newStock,
          available: inventory.available + quantity,
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

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          variantId,
          type: StockMovementType.STOCK_IN,
          quantity,
          previousStock,
          newStock,
          reason,
          referenceId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { inventory: updatedInventory, movement };
    });

    return result;
  }

  /**
   * Stock Out (Xuất kho thủ công)
   */
  async stockOut(data: StockOutData) {
    const { variantId, quantity, reason, referenceId, userId } = data;

    // Validate quantity
    if (quantity <= 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY);
    }

    // Validate variant exists
    const variant = await this.productRepository.findVariantById(variantId);
    if (!variant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VARIANT_NOT_FOUND);
    }

    // Get inventory
    const inventory = await this.inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.INVENTORY_NOT_FOUND);
    }

    // Check if enough stock available
    if (inventory.available < quantity) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.INSUFFICIENT_STOCK} (Có sẵn: ${inventory.available})`
      );
    }

    // Use transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const previousStock = inventory.quantity;
      const newStock = previousStock - quantity;

      // Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newStock,
          available: inventory.available - quantity,
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

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          variantId,
          type: StockMovementType.STOCK_OUT,
          quantity: -quantity, // Negative for stock out
          previousStock,
          newStock,
          reason,
          referenceId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { inventory: updatedInventory, movement };
    });

    return result;
  }

  /**
   * Stock Adjustment (Điều chỉnh tồn kho - thường dùng khi kiểm kê)
   */
  async adjustStock(data: StockAdjustmentData) {
    const { variantId, newQuantity, reason, userId } = data;

    // Validate new quantity
    if (newQuantity < 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY);
    }

    // Validate variant exists
    const variant = await this.productRepository.findVariantById(variantId);
    if (!variant) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.VARIANT_NOT_FOUND);
    }

    // Get or create inventory
    const inventory = await this.inventoryRepository.getOrCreateInventory(variantId);

    const previousStock = inventory.quantity;
    const difference = newQuantity - previousStock;

    // If no change, return current inventory
    if (difference === 0) {
      return {
        inventory,
        movement: null,
        message: 'Không có thay đổi về số lượng tồn kho',
      };
    }

    // Use transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Calculate new available stock (maintain reserved stock)
      const newAvailable = Math.max(0, newQuantity - inventory.reserved);

      // Update inventory
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQuantity,
          available: newAvailable,
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

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          variantId,
          type: StockMovementType.ADJUSTMENT,
          quantity: difference,
          previousStock,
          newStock: newQuantity,
          reason: reason || 'Điều chỉnh tồn kho',
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { inventory: updatedInventory, movement };
    });

    return result;
  }

  /**
   * Get stock movement history for a variant
   */
  async getStockMovements(filter: StockMovementFilter) {
    const result = await this.inventoryRepository.getStockMovements(filter);

    return {
      movements: result.movements,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats() {
    return await this.inventoryRepository.getInventoryStats();
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(limit: number = 20) {
    return await this.inventoryRepository.getLowStockItems(limit);
  }

  /**
   * Update stock thresholds (minStock, maxStock)
   */
  async updateStockThresholds(
    variantId: string,
    minStock: number,
    maxStock: number
  ) {
    // Validate thresholds
    if (minStock < 0 || maxStock < 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_QUANTITY);
    }

    if (minStock > maxStock && maxStock > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Ngưỡng tối thiểu không được lớn hơn ngưỡng tối đa'
      );
    }

    // Get or create inventory
    const inventory = await this.inventoryRepository.getOrCreateInventory(variantId);

    // Update thresholds
    return await this.inventoryRepository.updateStockThresholds(
      inventory.id,
      minStock,
      maxStock
    );
  }

  /**
   * Reserve stock (used by Order API)
   */
  async reserveStock(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findByVariantId(variantId);
    if (!inventory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.INVENTORY_NOT_FOUND);
    }

    if (inventory.available < quantity) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `${ERROR_MESSAGES.INSUFFICIENT_STOCK} (Có sẵn: ${inventory.available})`
      );
    }

    return await this.inventoryRepository.reserveStock(variantId, quantity);
  }

  /**
   * Release reserved stock (used when order is cancelled)
   */
  async releaseReservedStock(variantId: string, quantity: number) {
    return await this.inventoryRepository.releaseReservedStock(variantId, quantity);
  }

  /**
   * Confirm stock deduction (used when order is completed)
   */
  async confirmStockDeduction(variantId: string, quantity: number) {
    return await this.inventoryRepository.confirmStockDeduction(variantId, quantity);
  }

  /**
   * Check stock availability (public method)
   */
  async checkAvailability(variantId: string) {
    const inventory = await this.inventoryRepository.findByVariantId(variantId);

    if (!inventory) {
      return {
        variantId,
        available: 0,
        inStock: false,
        isLowStock: false,
      };
    }

    const isLowStock = inventory.minStock > 0 && inventory.available < inventory.minStock;

    return {
      variantId,
      available: inventory.available,
      inStock: inventory.available > 0,
      isLowStock,
      quantity: inventory.quantity,
      reserved: inventory.reserved,
    };
  }
}
