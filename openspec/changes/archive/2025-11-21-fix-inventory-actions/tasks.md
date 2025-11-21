## 1. Backend Implementation
- [x] 1.1 Implement `quickUpdateQuantity` in `InventoryController` to handle `PUT /api/inventory/:variantId/quantity`.
- [x] 1.2 Add `PUT /:variantId/quantity` route in `inventoryRoutes.ts`.
- [x] 1.3 Verify `InventoryService` can handle the update (likely using `adjustStock` logic).

## 2. Frontend Implementation
- [x] 2.1 Update `InventoryPage.tsx` to pass `variantId` instead of `productId` in `StockMutationPayload` for 'stock-in' and 'stock-out'.
- [x] 2.2 Update `InventoryPage.tsx` to pass `variantId` instead of `productId` in `StockAdjustmentPayload` for 'adjust'.
- [x] 2.3 Ensure `inventoryService.quickUpdateQuantity` calls the correct endpoint `PUT /api/inventory/:variantId/quantity` and sends the correct payload.
