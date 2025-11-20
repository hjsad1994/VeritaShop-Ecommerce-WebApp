import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/InventoryService';
import { InventoryDto, StockMovementDto } from '../dtos/InventoryDto';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Create inventory record manually
   * POST /api/inventory
   * Auth: Required (ADMIN, MANAGER)
   */
  createInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const {
        productId,
        variantId,
        initialQuantity,
        minStock,
        maxStock,
        reason,
      } = req.body;

      const result = await this.inventoryService.createInventoryRecord({
        variantId: variantId || productId,
        initialQuantity,
        minStock,
        maxStock,
        reason,
        userId,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_INVENTORY_SUCCESS,
        data: {
          inventory: new InventoryDto(result.inventory),
          movement: result.movement ? new StockMovementDto(result.movement) : null,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory catalog summary for picker
   * GET /api/inventory/catalog
   * Auth: Required (ADMIN, MANAGER)
   */
  getInventoryCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        search,
        brandId,
        includeArchived,
        page = '1',
        limit = '12',
      } = req.query;

      const result = await this.inventoryService.getInventoryCatalog({
        search: (search as string) || undefined,
        brandId: (brandId as string) || undefined,
        includeArchived: includeArchived === 'true',
        page: parseInt(page as string, 10) || 1,
        limit: Math.min(parseInt(limit as string, 10) || 12, 50),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_INVENTORY_CATALOG_SUCCESS,
        data: result.catalog,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all inventory with filters and pagination
   * GET /api/inventory
   * Auth: Required (ADMIN, MANAGER)
   */
  getAllInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        variantId,
        minAvailable,
        maxAvailable,
        lowStock,
        search,
        brandId,
        includeArchived,
        status,
        sort,
        page = '1',
        limit = '20',
      } = req.query;

      const filter = {
        variantId: variantId as string,
        minAvailable: minAvailable ? parseInt(minAvailable as string) : undefined,
        maxAvailable: maxAvailable ? parseInt(maxAvailable as string) : undefined,
        lowStock: lowStock === 'true',
        search: search as string,
        brandId: brandId as string,
        includeArchived: includeArchived === 'true',
        status: status as 'low' | 'out' | 'archived' | undefined,
        sort: (sort as 'available' | 'updatedAt') || 'updatedAt',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.inventoryService.getAllInventory(filter);

      const inventoryDtos = result.inventories.map(
        (inventory: any) => new InventoryDto(inventory)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_INVENTORY_SUCCESS,
        data: {
          inventories: inventoryDtos,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory by variant ID
   * GET /api/inventory/variant/:variantId
   * Auth: Optional (public for checking availability)
   */
  getInventoryByVariantId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;

      const inventory = await this.inventoryService.getInventoryByVariantId(
        variantId
      );

      const inventoryDto = new InventoryDto(inventory);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_INVENTORY_SUCCESS,
        data: inventoryDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stock In (Nhập kho)
   * POST /api/inventory/stock-in
   * Auth: Required (ADMIN, MANAGER)
   */
  stockIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { variantId, quantity, reason, referenceId } = req.body;

      const result = await this.inventoryService.stockIn({
        variantId,
        quantity,
        reason,
        referenceId,
        userId,
      });

      const inventoryDto = new InventoryDto(result.inventory);
      const movementDto = new StockMovementDto(result.movement);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.STOCK_IN_SUCCESS,
        data: {
          inventory: inventoryDto,
          movement: movementDto,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stock Out (Xuất kho thủ công)
   * POST /api/inventory/stock-out
   * Auth: Required (ADMIN, MANAGER)
   */
  stockOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { variantId, quantity, reason, referenceId } = req.body;

      const result = await this.inventoryService.stockOut({
        variantId,
        quantity,
        reason,
        referenceId,
        userId,
      });

      const inventoryDto = new InventoryDto(result.inventory);
      const movementDto = new StockMovementDto(result.movement);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.STOCK_OUT_SUCCESS,
        data: {
          inventory: inventoryDto,
          movement: movementDto,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Adjust Stock (Điều chỉnh tồn kho - kiểm kê)
   * POST /api/inventory/adjustment
   * Auth: Required (ADMIN, MANAGER)
   */
  adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { variantId, newQuantity, reason } = req.body;

      const result = await this.inventoryService.adjustStock({
        variantId,
        newQuantity,
        reason,
        userId,
      });

      const inventoryDto = new InventoryDto(result.inventory);
      const movementDto = result.movement
        ? new StockMovementDto(result.movement)
        : null;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.ADJUSTMENT_SUCCESS,
        data: {
          inventory: inventoryDto,
          movement: movementDto,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get stock movement history
   * GET /api/inventory/movements/:variantId
   * Auth: Optional - but detailed info for Admin/Manager
   */
  getStockMovements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const {
        type,
        userId,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;

      const filter = {
        variantId,
        type: type as any,
        userId: userId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await this.inventoryService.getStockMovements(filter);

      const movementDtos = result.movements.map(
        (movement: any) => new StockMovementDto(movement)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_MOVEMENTS_SUCCESS,
        data: {
          movements: movementDtos,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory statistics
   * GET /api/inventory/stats
   * Auth: Required (ADMIN, MANAGER)
   */
  getInventoryStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.inventoryService.getInventoryStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_STATS_SUCCESS,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low stock items
   * GET /api/inventory/low-stock
   * Auth: Required (ADMIN, MANAGER)
   */
  getLowStockItems = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { limit = '20' } = req.query;

      const items = await this.inventoryService.getLowStockItems(
        parseInt(limit as string)
      );

      const itemDtos = items.map((item: any) => new InventoryDto(item));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_LOW_STOCK_SUCCESS,
        data: itemDtos,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update stock thresholds (minStock, maxStock)
   * PUT /api/inventory/:variantId/thresholds
   * Auth: Required (ADMIN, MANAGER)
   */
  updateStockThresholds = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;
      const { minStock, maxStock } = req.body;

      const inventory = await this.inventoryService.updateStockThresholds(
        variantId,
        minStock,
        maxStock
      );

      const inventoryDto = new InventoryDto(inventory);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_THRESHOLDS_SUCCESS,
        data: inventoryDto,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check availability (public endpoint)
   * GET /api/inventory/check/:variantId
   * Auth: Not required (public)
   */
  checkAvailability = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { variantId } = req.params;

      const availability = await this.inventoryService.checkAvailability(
        variantId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.CHECK_AVAILABILITY_SUCCESS,
        data: availability,
      });
    } catch (error) {
      next(error);
    }
  };
}
