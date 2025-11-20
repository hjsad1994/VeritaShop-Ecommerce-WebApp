'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { brandService, inventoryService } from '@/lib/api';
import type {
  Brand,
  CreateInventoryPayload,
  InventoryRecord,
  InventoryStats,
  PaginationMeta,
  QuickQuantityUpdatePayload,
  StockAdjustmentPayload,
  StockMutationPayload,
  UpdateThresholdPayload,
} from '@/lib/api';
import InventoryActionModal, {
  InventoryActionFormValues,
  InventoryActionMode,
} from './components/InventoryActionModal';
import InventoryMovementDrawer from './components/InventoryMovementDrawer';
import VariantContextPanel from './components/VariantContextPanel';

interface InventoryFilters {
  search: string;
  brandId: string;
  lowStockOnly: boolean;
  includeArchived: boolean;
  page: number;
}

const PAGE_SIZE = 10;

const initialFilters: InventoryFilters = {
  search: '',
  brandId: 'all',
  lowStockOnly: false,
  includeArchived: false,
  page: 1,
};

type ModalState =
  | null
  | {
      mode: InventoryActionMode;
      inventory?: InventoryRecord;
      initialVariantId?: string;
    };

const getErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return fallback;
};

const resolveVariantId = (record?: InventoryRecord): string =>
  record?.variant?.id ?? record?.variantId ?? record?.productId ?? '';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRecord[] | null>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [movementState, setMovementState] = useState<{
    open: boolean;
    inventory?: InventoryRecord;
  }>({ open: false });

  useEffect(() => {
    brandService
      .getBrands({ isActive: true, limit: 100 })
      .then((response) => setBrands(response.brands))
      .catch((error) => {
        console.error(error);
        toast.error(getErrorMessage(error, 'Failed to load brands'));
      });
  }, []);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [inventoryResponse, statsResponse] = await Promise.all([
        inventoryService.getInventory({
          page: filters.page,
          limit: PAGE_SIZE,
          search: filters.search || undefined,
          brandId: filters.brandId !== 'all' ? filters.brandId : undefined,
          lowStock: filters.lowStockOnly || undefined,
          includeArchived: filters.includeArchived || undefined,
          status: filters.lowStockOnly ? 'low' : undefined,
        }),
        inventoryService.getInventoryStats(),
      ]);

      setInventory(
        Array.isArray(inventoryResponse.inventories)
          ? inventoryResponse.inventories
          : []
      );
      setPagination(inventoryResponse.pagination);
      setStats(statsResponse);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to load inventory'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: event.target.value,
      page: 1,
    }));
  };

  const handleToggle = (key: 'lowStockOnly' | 'includeArchived') => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
      page: 1,
    }));
  };

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      brandId: event.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (!pagination) return;
    setFilters((prev) => ({
      ...prev,
      page: Math.max(
        1,
        Math.min(
          pagination.totalPages,
          direction === 'prev' ? prev.page - 1 : prev.page + 1
        )
      ),
    }));
  };

  const openModal = (mode: InventoryActionMode, record: InventoryRecord) => {
    setModalState({ mode, inventory: record });
  };

  const closeModal = () => setModalState(null);

  const handleMovementDrawer = (record: InventoryRecord) => {
    setMovementState({ open: true, inventory: record });
  };

  const closeMovementDrawer = () => setMovementState({ open: false });

  const handleModalSubmit = async (values: InventoryActionFormValues) => {
    if (!modalState) return;

    const targetVariantId =
      values.productId ||
      modalState.initialVariantId ||
      resolveVariantId(modalState.inventory);

    if (!targetVariantId) {
      toast.error('Please select a product variant before continuing');
      return;
    }

    try {
      switch (modalState.mode) {
        case 'create': {
          const payload: CreateInventoryPayload = {
            variantId: targetVariantId,
            initialQuantity: Number(values.initialQuantity ?? 0),
            minStock: Number(values.minStock ?? 0),
            maxStock: Number(values.maxStock ?? 0),
            reason: values.reason,
          };
          await inventoryService.createInventory(payload);
          toast.success('Inventory record created');
          break;
        }
        case 'stock-in':
        case 'stock-out': {
          const payload: StockMutationPayload = {
            variantId: targetVariantId,
            quantity: Number(values.quantity ?? 0),
            reason: values.reason || undefined,
            referenceId: values.referenceId || undefined,
          };
          if (modalState.mode === 'stock-in') {
            await inventoryService.stockIn(payload);
            toast.success('Stock in recorded');
          } else {
            await inventoryService.stockOut(payload);
            toast.success('Stock out recorded');
          }
          break;
        }
        case 'adjust': {
          const payload: StockAdjustmentPayload = {
            variantId: targetVariantId,
            newQuantity: Number(values.newQuantity ?? 0),
            reason: values.reason || '',
          };
          await inventoryService.adjustStock(payload);
          toast.success('Inventory adjusted');
          break;
        }
        case 'quick-update': {
          const payload: QuickQuantityUpdatePayload = {
            quantity: Number(
              values.newQuantity ?? modalState.inventory?.quantity ?? 0
            ),
          };
          await inventoryService.quickUpdateQuantity(
            targetVariantId,
            payload
          );
          toast.success('Quantity updated');
          break;
        }
        case 'thresholds': {
          const payload: UpdateThresholdPayload = {
            minStock: Number(values.minStock ?? 0),
            maxStock: Number(values.maxStock ?? 0),
          };
          await inventoryService.updateThresholds(
            targetVariantId,
            payload
          );
          toast.success('Thresholds updated');
          break;
        }
        case 'archive': {
          await inventoryService.archiveInventory(targetVariantId);
          toast.success('Inventory archived');
          break;
        }
        default:
          break;
      }

      closeModal();
      await loadInventory();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Failed to perform inventory action'));
      throw error;
    }
  };

  const summaryCards = useMemo(() => {
    if (!stats) {
      return [];
    }
    return [
      {
        label: 'Tracked Products',
        value: stats.totalInventory,
      },
      {
        label: 'Total Quantity',
        value: stats.totalQuantity,
      },
      {
        label: 'Available Units',
        value: stats.totalAvailable,
      },
      {
        label: 'Low Stock Alerts',
        value: stats.lowStockCount,
        highlight: stats.lowStockCount > 0,
      },
    ];
  }, [stats]);

  const inventoryItems = Array.isArray(inventory) ? inventory : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-600">
              Monitor stock levels, record manual movements, and set alert thresholds.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setFilters(initialFilters);
              }}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryCards.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
                  card.highlight ? 'ring-1 ring-red-200' : ''
                }`}
              >
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Filter Bar */}
        <div className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Search by product name or slug
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={handleSearchChange}
                    placeholder="e.g., iPhone 15 Pro Max or iphone-15-pro-max"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <svg
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Brand
                <select
                  value={filters.brandId}
                  onChange={handleBrandChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="all">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={filters.lowStockOnly}
                  onChange={() => handleToggle('lowStockOnly')}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Low stock only
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={filters.includeArchived}
                  onChange={() => handleToggle('includeArchived')}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                Include archived
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-6">
        {/* Inventory Table Panel */}
        <section className="overflow-y-auto space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Product & Variant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Thresholds
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-600">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-600">
                        No inventory records match the current filters.
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item) => {
                      const productName = item.product?.name ?? 'Unknown product';
                      const variant = item.variant;
                      const variantOptions = [
                        variant?.color,
                        variant?.storage,
                        variant?.ram
                      ].filter(Boolean).join(' / ');
                      const brandName = item.product?.brand?.name ?? 'Unassigned brand';
                      
                      const statusBadges = [
                        item.isLowStock && (
                          <span
                            key="low"
                            className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800"
                          >
                            Low stock
                          </span>
                        ),
                        item.isOutOfStock && (
                          <span
                            key="out"
                            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700"
                          >
                            Out of stock
                          </span>
                        ),
                        item.isArchived && (
                          <span
                            key="archived"
                            className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700"
                          >
                            Archived
                          </span>
                        ),
                      ].filter(Boolean);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">{productName}</p>
                            <p className="text-sm text-gray-600">{variantOptions || 'Default'}</p>
                            <p className="text-xs text-gray-500">SKU: {variant?.sku}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{brandName}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.available} available
                            </p>
                            <p className="text-xs text-gray-500">
                              Total {item.quantity} • Reserved {item.reserved}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            Min {item.minStock} / Max {item.maxStock}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {statusBadges.length > 0 ? (
                                statusBadges
                              ) : (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  Healthy
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openModal('stock-in', item)}
                                disabled={item.isArchived}
                                className="rounded-lg bg-black px-3 py-1 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Stock In
                              </button>
                              <button
                                onClick={() => openModal('stock-out', item)}
                                disabled={item.isArchived}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Stock Out
                              </button>
                              <button
                                onClick={() => openModal('quick-update', item)}
                                disabled={item.isArchived}
                                className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Quick
                              </button>
                              <button
                                onClick={() => openModal('thresholds', item)}
                                disabled={item.isArchived}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Thresholds
                              </button>
                              <button
                                onClick={() => handleMovementDrawer(item)}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                              >
                                History
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-sm text-gray-600">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={filters.page === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={pagination.page === pagination.totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {modalState && (
        <InventoryActionModal
          isOpen
          mode={modalState.mode}
          inventory={modalState.inventory}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          initialVariantId={modalState.initialVariantId}
        />
      )}

      <InventoryMovementDrawer
        isOpen={movementState.open}
        inventory={movementState.inventory}
        onClose={closeMovementDrawer}
      />
    </div>
  );
}
