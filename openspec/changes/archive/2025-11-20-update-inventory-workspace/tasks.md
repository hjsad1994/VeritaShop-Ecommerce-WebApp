## 1. Research & UX blueprint
- [x] 1.1 Audit current `/admin/inventory` data flows (catalog picker, table, movement drawer) and capture gaps for variant selection + filters.
- [x] 1.2 Produce low-fidelity wireframes of the three-panel workspace showing sticky filter bar, catalog column, inventory table, and variant context panel; align with stakeholders for copy and interactions.

## 2. Backend API updates
- [x] 2.1 Update `getAllInventoryValidation`, controller, service, and repository logic so `GET /api/inventory` supports `brandId`, `includeArchived`, `status` (`low`, `out`, `archived`), `sort` (updatedAt vs available), and consistent pagination meta.
- [x] 2.2 Extend the inventory list/variant detail payloads to include per-variant summary fields (min/max stock, reserved, lastMovementAt) needed by the new context panel; ensure both list and detail endpoints reuse the same DTO.
- [ ] 2.3 Add service-level coverage that proves the new filters work together (e.g., brand + low stock) and that archived variants only return when requested.

## 3. Frontend workspace implementation
- [x] 3.1 Rebuild `InventoryPage` into a layout with a persistent filter toolbar, collapsible catalog column, and responsive table area; introduce virtualization or incremental loading for large lists.
- [x] 3.2 Implement a variant context panel that syncs with selections from either the catalog cards or inventory table and pipes the summary info + quick actions (`Stock In`, `Stock Out`, `Adjust`, `Thresholds`).
- [x] 3.3 Wire all manual action modals to the selected variant, surfacing inline validation for missing selection, and refactor shared hooks/state so `Stock In Selected` reflects the current context.

## 4. QA & validation
- [ ] 4.1 Manual QA: exercise `Create`, `Stock In`, `Stock Out`, `Adjust`, `Thresholds`, and movement history from the new workspace on both desktop and tablet breakpoints.
- [ ] 4.2 Regression QA: confirm `inventoryService.getCatalog`, stats cards, and movement drawer still operate with the updated endpoints.
- [x] 4.3 Run `openspec validate update-inventory-workspace --strict` plus project linters before requesting review.

