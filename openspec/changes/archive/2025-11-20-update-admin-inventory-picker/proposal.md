# Change: Improve admin inventory product selection

## Why
Admins currently have to type raw `productId`/`variantId` values when creating inventory or recording stock movements. Those IDs are only visible in the database, so the workflow is error-prone and blocks non-technical staff from adjusting stock levels.

## What Changes
- Surface a searchable list of products and their variants directly inside `/admin/inventory`, including brand, SKU, and current stock info.
- Replace free-text ID inputs inside inventory actions with a picker that binds to the selected product/variant from that list.
- Expose a lightweight backend endpoint that returns the catalog summary (product + variant metadata) needed by the picker.

## Impact
- Affected specs: `inventory-admin-experience`
- Affected code: `frontend/src/features/admin/InventoryPage.tsx`, related admin inventory components, `frontend/src/lib/api/*inventory*`, `backend/src/routes/inventoryRoutes.ts`, `backend/src/controllers/InventoryController.ts`, `backend/src/services/InventoryService.ts`, `backend/src/repositories/*` for query support.

