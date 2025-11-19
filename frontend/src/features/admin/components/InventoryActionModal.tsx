'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { InventoryRecord } from '@/lib/api';

export type InventoryActionMode =
  | 'create'
  | 'stock-in'
  | 'stock-out'
  | 'adjust'
  | 'thresholds'
  | 'archive'
  | 'quick-update';

export type InventoryActionFormValues = {
  productId?: string;
  initialQuantity?: number | string;
  minStock?: number | string;
  maxStock?: number | string;
  reason?: string;
  quantity?: number | string;
  referenceId?: string;
  newQuantity?: number | string;
  confirmation?: string;
};

interface InventoryActionModalProps {
  isOpen: boolean;
  mode: InventoryActionMode;
  inventory?: InventoryRecord;
  onClose: () => void;
  onSubmit: (values: InventoryActionFormValues) => Promise<void>;
}

type NumberFieldKey = 'quantity' | 'initialQuantity' | 'minStock' | 'maxStock' | 'newQuantity';

const numberFields: NumberFieldKey[] = ['quantity', 'initialQuantity', 'minStock', 'maxStock', 'newQuantity'];

const defaultValuesByMode: Record<InventoryActionMode, InventoryActionFormValues> = {
  create: {
    productId: '',
    initialQuantity: 0,
    minStock: 0,
    maxStock: 0,
    reason: '',
  },
  'stock-in': {
    quantity: 1,
    reason: '',
    referenceId: '',
  },
  'stock-out': {
    quantity: 1,
    reason: '',
    referenceId: '',
  },
  adjust: {
    newQuantity: 0,
    reason: '',
  },
  'quick-update': {
    newQuantity: 0,
  },
  thresholds: {
    minStock: 0,
    maxStock: 0,
  },
  archive: {
    confirmation: '',
  },
};

const getTitle = (mode: InventoryActionMode) => {
  switch (mode) {
    case 'create':
      return 'Create Inventory';
    case 'stock-in':
      return 'Stock In';
    case 'stock-out':
      return 'Stock Out';
    case 'adjust':
      return 'Adjust Stock';
    case 'quick-update':
      return 'Quick Quantity Update';
    case 'thresholds':
      return 'Update Thresholds';
    case 'archive':
      return 'Archive Inventory';
    default:
      return 'Inventory Action';
  }
};

const getDefaultValues = (
  mode: InventoryActionMode,
  inventory?: InventoryRecord
): InventoryActionFormValues => {
  const base = { ...defaultValuesByMode[mode] };

  if (inventory) {
    if (mode === 'adjust' || mode === 'quick-update') {
      base.newQuantity = inventory.quantity;
    }
    if (mode === 'thresholds') {
      base.minStock = inventory.minStock;
      base.maxStock = inventory.maxStock;
    }
  }

  return base;
};

const validateValues = (
  mode: InventoryActionMode,
  values: InventoryActionFormValues
): string | null => {
  switch (mode) {
    case 'create':
      if (!values.productId) {
        return 'Product ID is required';
      }
      if (Number(values.initialQuantity) < 0) {
        return 'Initial quantity cannot be negative';
      }
      if (Number(values.minStock) < 0 || Number(values.maxStock) < 0) {
        return 'Thresholds must be non-negative';
      }
      if (
        Number(values.maxStock) > 0 &&
        Number(values.minStock) > Number(values.maxStock)
      ) {
        return 'Min stock cannot exceed max stock';
      }
      return null;
    case 'stock-in':
    case 'stock-out':
      if (Number(values.quantity) <= 0) {
        return 'Please enter a quantity greater than 0';
      }
      return null;
    case 'adjust':
      if (Number(values.newQuantity) < 0) {
        return 'New quantity cannot be negative';
      }
      if (!values.reason || values.reason.trim().length < 3) {
        return 'Please provide a reason (min 3 characters)';
      }
      return null;
    case 'quick-update':
      if (Number(values.newQuantity) < 0) {
        return 'Target quantity cannot be negative';
      }
      return null;
    case 'thresholds':
      if (Number(values.minStock) < 0 || Number(values.maxStock) < 0) {
        return 'Thresholds must be non-negative';
      }
      if (
        Number(values.maxStock) > 0 &&
        Number(values.minStock) > Number(values.maxStock)
      ) {
        return 'Min stock cannot exceed max stock';
      }
      return null;
    case 'archive':
      if (values.confirmation !== 'ARCHIVE') {
        return 'Type ARCHIVE to confirm';
      }
      return null;
    default:
      return null;
  }
};

export function InventoryActionModal({
  isOpen,
  mode,
  inventory,
  onClose,
  onSubmit,
}: InventoryActionModalProps) {
  const [formValues, setFormValues] = useState<InventoryActionFormValues>(
    getDefaultValues(mode, inventory)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormValues(getDefaultValues(mode, inventory));
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, mode, inventory]);

  const title = useMemo(() => getTitle(mode), [mode]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateValues(mode, formValues);

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: InventoryActionFormValues = { ...formValues };
    numberFields.forEach((field) => {
      const value = payload[field];
      if (value !== undefined && value !== '') {
        payload[field] = Number(value) as InventoryActionFormValues[typeof field];
      }
    });

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to perform inventory action';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInventorySummary = () => {
    if (!inventory) return null;
    const productName = inventory.product?.name ?? 'Unknown product';
    return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">{productName}</p>
        <p className="text-sm text-gray-600">
          Slug: {inventory.product?.slug ?? inventory.productId}
        </p>
        <p className="text-sm text-gray-600">
          Current stock: <strong>{inventory.quantity}</strong> (Available{' '}
          {inventory.available}, Reserved {inventory.reserved})
        </p>
        {inventory.isArchived && (
          <p className="mt-2 text-xs font-semibold uppercase text-red-600">
            Archived
          </p>
        )}
      </div>
    );
  };

  const renderFields = () => {
    switch (mode) {
      case 'create':
        return (
          <>
            <label className="text-sm font-medium text-gray-700">
              Product ID
              <input
                name="productId"
                value={formValues.productId}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Enter product ID"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-700">
                Initial Quantity
                <input
                  type="number"
                  name="initialQuantity"
                  value={formValues.initialQuantity}
                  min={0}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Min Stock
                <input
                  type="number"
                  name="minStock"
                  value={formValues.minStock}
                  min={0}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </label>
            </div>
            <label className="text-sm font-medium text-gray-700">
              Max Stock
              <input
                type="number"
                name="maxStock"
                value={formValues.maxStock}
                min={0}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Reason (optional)
              <textarea
                name="reason"
                value={formValues.reason}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Add context for the initial balance"
              />
            </label>
          </>
        );
      case 'stock-in':
      case 'stock-out':
        return (
          <>
            {renderInventorySummary()}
            <label className="text-sm font-medium text-gray-700">
              Quantity
              <input
                type="number"
                name="quantity"
                value={formValues.quantity}
                min={1}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Reason (optional)
              <textarea
                name="reason"
                value={formValues.reason}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Describe why this stock change is needed"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Reference ID (optional)
              <input
                name="referenceId"
                value={formValues.referenceId}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., PO-2025-0001"
              />
            </label>
          </>
        );
      case 'adjust':
        return (
          <>
            {renderInventorySummary()}
            <label className="text-sm font-medium text-gray-700">
              New Quantity
              <input
                type="number"
                name="newQuantity"
                value={formValues.newQuantity}
                min={0}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Reason
              <textarea
                name="reason"
                value={formValues.reason}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Explain why this adjustment is necessary"
              />
            </label>
          </>
        );
      case 'quick-update':
        return (
          <>
            {renderInventorySummary()}
            <label className="text-sm font-medium text-gray-700">
              Target Quantity
              <input
                type="number"
                name="newQuantity"
                value={formValues.newQuantity}
                min={0}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </label>
            <p className="text-xs text-gray-500">
              Enter the exact stock level you want saved. Audit details are recorded automatically.
            </p>
          </>
        );
      case 'thresholds':
        return (
          <>
            {renderInventorySummary()}
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-700">
                Min Stock
                <input
                  type="number"
                  name="minStock"
                  value={formValues.minStock}
                  min={0}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Max Stock
                <input
                  type="number"
                  name="maxStock"
                  value={formValues.maxStock}
                  min={0}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </label>
            </div>
          </>
        );
      case 'archive':
        return (
          <>
            {renderInventorySummary()}
            <p className="text-sm text-gray-600">
              This action will hide the inventory record but keep its audit history. Ensure
              quantity, available, and reserved are zero before archiving.
            </p>
            <label className="text-sm font-medium text-gray-700">
              Type <span className="font-semibold">ARCHIVE</span> to confirm
              <input
                name="confirmation"
                value={formValues.confirmation}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {renderFields()}

          {error && (
            <div
              data-testid="inventory-modal-error"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InventoryActionModal;
