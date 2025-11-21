# Change: Fix Inventory Actions

## Why
The "Stock In", "Stock Out", and "Quick Update" actions in the admin inventory page are failing.
- "Stock In/Out" and "Adjust" fail because the frontend sends `productId` in the payload, while the backend expects `variantId`.
- "Quick Update" fails because the backend route `PUT /api/inventory/:variantId/quantity` does not exist.

## What Changes
- **Backend**:
    - Add `PUT /api/inventory/:variantId/quantity` route.
    - Implement `quickUpdateQuantity` in `InventoryController`.
    - Ensure `InventoryService` supports explicit quantity update.
- **Frontend**:
    - Update `InventoryPage` to correctly pass `variantId` in payloads for `stock-in`, `stock-out`, `adjust`, and `quick-update`.

## Impact
- **Affected specs**: `inventory-admin-experience`
- **Affected code**:
    - `backend/src/routes/inventoryRoutes.ts`
    - `backend/src/controllers/InventoryController.ts`
    - `frontend/src/features/admin/InventoryPage.tsx`
    - `frontend/src/lib/api/inventoryService.ts` (to align with backend)
