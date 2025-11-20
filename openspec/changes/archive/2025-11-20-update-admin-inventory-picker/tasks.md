## 1. Research & API contract
- [x] 1.1 Confirm current inventory creation payloads and identify where variant IDs are required.
- [x] 1.2 Design the catalog summary endpoint (filters, pagination, fields) and document expected response shape.

## 2. Backend changes
- [x] 2.1 Implement repository/service queries to fetch products with nested variants, SKU, and inventory stats for the picker.
- [x] 2.2 Add authenticated route/controller method (e.g., `GET /api/inventory/catalog`) returning the catalog summary with search + brand filters.
- [x] 2.3 Add unit or integration coverage (service-level) to ensure the endpoint enforces role checks and returns accurate data.

## 3. Frontend updates
- [x] 3.1 Extend `inventoryService` (or new helper) to call the catalog endpoint with search/brand params.
- [x] 3.2 Update `/admin/inventory` UI to render the product + variant list (sortable/searchable) alongside existing inventory table.
- [x] 3.3 Replace manual ID inputs inside `InventoryActionModal` with a controlled picker tied to the catalog list selection.
- [x] 3.4 Add empty/loading/error states plus a quick-copy action for IDs to help manual workflows when needed.

## 4. QA & validation
- [x] 4.1 Manual QA: verify selecting a product/variant populates stock-in/out/adjust forms and successfully performs each action.
- [x] 4.2 Regression QA: ensure inventory list filters and summary cards still load without the picker data.
- [x] 4.3 Update admin docs/readme snippets to mention the new picker flow if applicable.

