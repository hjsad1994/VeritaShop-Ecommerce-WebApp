'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { inventoryService } from '@/lib/api';
import type { InventoryRecord, StockMovement } from '@/lib/api';

interface InventoryMovementDrawerProps {
  isOpen: boolean;
  inventory?: InventoryRecord;
  onClose: () => void;
}

export default function InventoryMovementDrawer({
  isOpen,
  inventory,
  onClose,
}: InventoryMovementDrawerProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMovements = useCallback(async (pageNum: number = 1, append = false) => {
    if (!inventory) return;

    setLoading(true);
    try {
      const response = await inventoryService.getStockMovements(inventory.productId, {
        page: pageNum,
        limit: 20,
      });

      if (append) {
        setMovements((prev) => [...prev, ...response.movements]);
      } else {
        setMovements(response.movements);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  }, [inventory]);

  useEffect(() => {
    if (isOpen && inventory) {
      setPage(1);
      setMovements([]);
      loadMovements(1, false);
    }
  }, [isOpen, inventory, loadMovements]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovements(nextPage, true);
  };

  const getMovementTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock_in':
        return 'bg-green-100 text-green-800';
      case 'stock_out':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-purple-100 text-purple-800';
      case 'order_cancelled':
        return 'bg-orange-100 text-orange-800';
      case 'return':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock_in':
        return 'Stock In';
      case 'stock_out':
        return 'Stock Out';
      case 'adjustment':
        return 'Adjustment';
      case 'order':
        return 'Order';
      case 'order_cancelled':
        return 'Order Cancelled';
      case 'return':
        return 'Return';
      default:
        return type;
    }
  };

  if (!isOpen || !inventory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div className="relative w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Stock Movements
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                  aria-label="Close drawer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <h3 className="font-medium text-gray-900">
                  {inventory.product?.name ?? 'Unknown Product'}
                </h3>
                <p className="text-sm text-gray-500">
                  Current stock: {inventory.quantity} ({inventory.available} available, {inventory.reserved} reserved)
                </p>
              </div>

              {/* Movements List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading && movements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">Loading movements...</div>
                  </div>
                ) : movements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-500">No stock movements found</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {movements.map((movement) => (
                      <div
                        key={movement.id}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${getMovementTypeColor(
                                movement.type
                              )}`}
                            >
                              {getMovementTypeLabel(movement.type)}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity} units
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {movement.previousStock} → {movement.newStock}
                            </div>
                          </div>
                        </div>

                        {movement.reason && (
                          <p className="mt-2 text-sm text-gray-600">
                            Reason: {movement.reason}
                          </p>
                        )}

                        {movement.referenceId && (
                          <p className="text-sm text-gray-500">
                            Ref: {movement.referenceId}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {new Date(movement.createdAt).toLocaleString()}
                          </p>
                          {movement.user && (
                            <p className="text-xs text-gray-500">
                              by {movement.user.name || movement.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {hasMore && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
