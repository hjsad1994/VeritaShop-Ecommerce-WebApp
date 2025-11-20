# Change: Redesign scalable inventory workspace

## Why
The current `/admin/inventory` screen becomes unwieldy once dozens of products and variants are tracked. Admins must scroll through long tables, picker cards grow without structure, and manual stock actions still require double-checking the target variant because the UI state is easy to lose. Filtering by brand, archived status, or availability thresholds is unsupported in the backend list API, so UI filters silently fail and manual stock updates for a specific `ProductVariant` are error-prone.

## What Changes
- Restructure the inventory experience into a three-column workspace (summary header, catalog picker, inventory table + detail panel) with sticky filters so admins can keep a selected variant in view while scanning large datasets.
- Couple manual actions (`Create`, `Stock In`, `Stock Out`, `Adjust`, `Thresholds`) to the currently selected variant from either the catalog or table and surface a context panel that highlights stock metrics plus the latest manual movements.
- Enhance the backend `GET /api/inventory` endpoint with brand, archived, and stock-status filters plus deterministic pagination metadata so the redesigned UI can fetch only the slice it needs.
- Expose an enriched variant summary payload (either by extending `GET /api/inventory/variant/:variantId` or returning it from list calls) that includes availability, thresholds, movement stats, and product metadata for the context panel.

## Impact
- Affected specs: `inventory-admin-experience`
- Affected code: `frontend/src/app/admin/inventory/page.tsx`, `frontend/src/features/admin/InventoryPage.tsx` and nested components, `frontend/src/lib/api/inventoryService.ts`, `backend/src/routes/inventoryRoutes.ts`, `backend/src/controllers/InventoryController.ts`, `backend/src/services/InventoryService.ts`, `backend/src/repositories/InventoryRepository.ts`, `backend/src/validations/InventoryValidation.ts`

