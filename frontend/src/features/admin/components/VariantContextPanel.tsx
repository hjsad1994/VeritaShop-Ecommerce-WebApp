'use client';

import React from 'react';
import type { InventoryRecord } from '@/lib/api';
import { inventoryService } from '@/lib/api';
import { useState, useEffect } from 'react';
import type { StockMovement } from '@/lib/api';

interface VariantContextPanelProps {
  selectedInventory: InventoryRecord | null;
  onAction: (mode: 'stock-in' | 'stock-out' | 'adjust' | 'thresholds') => void;
  onViewMovements: () => void;
}

export default function VariantContextPanel({
  selectedInventory,
  onAction,
  onViewMovements,
}: VariantContextPanelProps) {
  const [latestMovement, setLatestMovement] = useState<StockMovement | null>(null);

  useEffect(() => {
    if (selectedInventory?.variantId) {
      inventoryService
        .getStockMovements(selectedInventory.variantId, { page: 1, limit: 1 })
        .then((response) => {
          if (response.movements && response.movements.length > 0) {
            setLatestMovement(response.movements[0]);
          } else {
            setLatestMovement(null);
          }
        })
        .catch(() => {
          setLatestMovement(null);
        });
    } else {
      setLatestMovement(null);
    }
  }, [selectedInventory?.variantId]);

  if (!selectedInventory) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Select a variant to view details</p>
        </div>
      </div>
    );
  }

  const productName = selectedInventory.product?.name ?? 'Unknown product';
  const variantOptions = [
    selectedInventory.variant?.color,
    selectedInventory.variant?.storage,
    selectedInventory.variant?.ram,
  ]
    .filter(Boolean)
    .join(' / ') || 'Default configuration';
  const sku = selectedInventory.variant?.sku ?? 'N/A';
  const brandName = selectedInventory.product?.brand?.name ?? 'Unassigned brand';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Variant Details</h3>
        <p className="text-xs text-gray-500 mt-1">Selected variant information</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{productName}</p>
          <p className="text-xs text-gray-500">{brandName}</p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Options</p>
            <p className="text-sm text-gray-900">{variantOptions}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">SKU</p>
            <p className="text-sm text-gray-900 font-mono">{sku}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Quantity</p>
            <p className="text-lg font-bold text-gray-900">{selectedInventory.quantity}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Available</p>
            <p className="text-lg font-bold text-gray-900">{selectedInventory.available}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Reserved</p>
            <p className="text-lg font-bold text-gray-900">{selectedInventory.reserved}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Status</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedInventory.isLowStock && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                  Low stock
                </span>
              )}
              {selectedInventory.isOutOfStock && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  Out of stock
                </span>
              )}
              {selectedInventory.isArchived && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  Archived
                </span>
              )}
              {!selectedInventory.isLowStock &&
                !selectedInventory.isOutOfStock &&
                !selectedInventory.isArchived && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Healthy
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Thresholds</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Min Stock</p>
              <p className="text-sm font-semibold text-gray-900">{selectedInventory.minStock}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Max Stock</p>
              <p className="text-sm font-semibold text-gray-900">{selectedInventory.maxStock}</p>
            </div>
          </div>
        </div>

        {selectedInventory.lastMovementAt && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Last Movement</p>
            <p className="text-xs text-gray-600">
              {new Date(selectedInventory.lastMovementAt).toLocaleString()}
            </p>
          </div>
        )}

        {latestMovement && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Latest Movement</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-900">
                <span className="font-semibold">{latestMovement.type}</span> •{' '}
                {latestMovement.quantity > 0 ? '+' : ''}
                {latestMovement.quantity}
              </p>
              {latestMovement.reason && (
                <p className="text-xs text-gray-600">{latestMovement.reason}</p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(latestMovement.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => onAction('stock-in')}
          disabled={selectedInventory.isArchived}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Stock In
        </button>
        <button
          onClick={() => onAction('stock-out')}
          disabled={selectedInventory.isArchived}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Stock Out
        </button>
        <button
          onClick={() => onAction('adjust')}
          disabled={selectedInventory.isArchived}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adjust
        </button>
        <button
          onClick={() => onAction('thresholds')}
          disabled={selectedInventory.isArchived}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Update Thresholds
        </button>
        <button
          onClick={onViewMovements}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View All Movements
        </button>
      </div>
    </div>
  );
}




