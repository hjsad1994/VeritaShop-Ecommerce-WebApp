import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate, authorize } from '../middleware';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';
import {
  stockInValidation,
  stockOutValidation,
  stockAdjustmentValidation,
  getInventoryByVariantIdValidation,
  getStockMovementsValidation,
  getAllInventoryValidation,
  getInventoryCatalogValidation,
  updateStockThresholdsValidation,
  checkAvailabilityValidation,
  createInventoryValidation,
  quickQuantityUpdateValidation,
} from '../validations/InventoryValidation';

export const createInventoryRoutes = (): Router => {
  const router = Router();
  const inventoryController = new InventoryController();

  /**
   * @route   POST /api/inventory
   * @desc    Create or seed inventory record
   * @access  Private (ADMIN, MANAGER)
   */
  router.post(
    '/',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(createInventoryValidation),
    inventoryController.createInventory
  );

  /**
   * @route   GET /api/inventory
   * @desc    Get all inventory with filters and pagination
   * @access  Private (ADMIN, MANAGER)
   */
  router.get(
    '/',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(getAllInventoryValidation),
    inventoryController.getAllInventory
  );

  /**
   * @route   GET /api/inventory/catalog
   * @desc    Get catalog summary for picker
   * @access  Private (ADMIN, MANAGER)
   */
  router.get(
    '/catalog',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(getInventoryCatalogValidation),
    inventoryController.getInventoryCatalog
  );

  /**
   * @route   GET /api/inventory/stats
   * @desc    Get inventory statistics
   * @access  Private (ADMIN, MANAGER)
   */
  router.get(
    '/stats',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    inventoryController.getInventoryStats
  );

  /**
   * @route   GET /api/inventory/low-stock
   * @desc    Get low stock items
   * @access  Private (ADMIN, MANAGER)
   */
  router.get(
    '/low-stock',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    inventoryController.getLowStockItems
  );

  /**
   * @route   GET /api/inventory/check/:variantId
   * @desc    Check availability (public)
   * @access  Public
   */
  router.get(
    '/check/:variantId',
    validate(checkAvailabilityValidation),
    inventoryController.checkAvailability
  );

  /**
   * @route   GET /api/inventory/variant/:variantId
   * @desc    Get inventory by variant ID
   * @access  Public (for checking stock availability)
   */
  router.get(
    '/variant/:variantId',
    validate(getInventoryByVariantIdValidation),
    inventoryController.getInventoryByVariantId
  );

  /**
   * @route   GET /api/inventory/movements/:variantId
   * @desc    Get stock movement history for a variant
   * @access  Private (ADMIN, MANAGER)
   */
  router.get(
    '/movements/:variantId',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(getStockMovementsValidation),
    inventoryController.getStockMovements
  );

  /**
   * @route   POST /api/inventory/stock-in
   * @desc    Stock In (Nhập kho)
   * @access  Private (ADMIN, MANAGER)
   */
  router.post(
    '/stock-in',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(stockInValidation),
    inventoryController.stockIn
  );

  /**
   * @route   POST /api/inventory/stock-out
   * @desc    Stock Out (Xuất kho thủ công)
   * @access  Private (ADMIN, MANAGER)
   */
  router.post(
    '/stock-out',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(stockOutValidation),
    inventoryController.stockOut
  );

  /**
   * @route   POST /api/inventory/adjustment
   * @desc    Adjust Stock (Điều chỉnh tồn kho)
   * @access  Private (ADMIN, MANAGER)
   */
  router.post(
    '/adjustment',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(stockAdjustmentValidation),
    inventoryController.adjustStock
  );

  /**
   * @route   PUT /api/inventory/:variantId/thresholds
   * @desc    Update stock thresholds (minStock, maxStock)
   * @access  Private (ADMIN, MANAGER)
   */
  router.put(
    '/:variantId/thresholds',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(updateStockThresholdsValidation),
    inventoryController.updateStockThresholds
  );

  /**
   * @route   PUT /api/inventory/:variantId/quantity
   * @desc    Quick update quantity
   * @access  Private (ADMIN, MANAGER)
   */
  router.put(
    '/:variantId/quantity',
    authenticate,
    authorize(Role.ADMIN, Role.MANAGER),
    validate(quickQuantityUpdateValidation),
    inventoryController.quickUpdateQuantity
  );

  return router;
};
