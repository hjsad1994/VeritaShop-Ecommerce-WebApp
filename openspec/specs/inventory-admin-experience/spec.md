# inventory-admin-experience Specification

## Purpose
TBD - created by archiving change update-admin-inventory-picker. Update Purpose after archive.
## Requirements
### Requirement: Inventory catalog summary endpoint
The backend SHALL expose an authenticated admin route at `/api/inventory/catalog` that returns a paginated list of products with their variants, brand labels, SKU, and current stock stats so the inventory picker can resolve IDs without database access.

#### Scenario: Fetch catalog for picker
- **WHEN** an `ADMIN` or `MANAGER` issues `GET /api/inventory/catalog` with optional `search`, `brandId`, or `includeArchived` query params
- **THEN** the API responds `200` with pagination metadata plus records shaped as `{ productId, name, slug, brandName, variants: [{ variantId, sku, optionLabels, quantity, isLowStock }] }`.

#### Scenario: Filter catalog results
- **WHEN** the request includes `search=iphone` or `brandId=<brand>`
- **THEN** only products/variants whose name, slug, or SKU match the query (and brand filter if provided) are returned so admins can quickly narrow the list.

### Requirement: Admin inventory picker UI
The `/admin/inventory` page SHALL display the product + variant catalog list next to the inventory table and integrate it into stock actions so admins never type raw IDs.

#### Scenario: View catalog list
- **WHEN** an authorized admin opens `/admin/inventory`
- **THEN** the UI loads the catalog endpoint, renders a searchable/filterable list showing product name, brand, variant option badges, SKU, and current quantity, and provides copy/select affordances even while inventory stats continue to load.

#### Scenario: Select variant for stock action
- **WHEN** the admin picks a product variant from the catalog or from a searchable combo inside `Create inventory`/`Stock in`/`Stock out`/`Adjust` modals
- **THEN** the modal auto-fills the corresponding `variantId`, shows a confirmation of the selection, and the subsequent submission succeeds without the user manually entering IDs.

### Requirement: Inventory workspace layout
The `/admin/inventory` route SHALL render as a three-panel workspace that keeps summary cards, filters, the product/variant picker, and the inventory table visible without excessive scrolling even when more than 100 variants exist.

#### Scenario: Summary header and primary actions
- **WHEN** an `ADMIN` or `MANAGER` opens `/admin/inventory`
- **THEN** the page displays headline copy, the four summary metrics (Tracked Products, Total Quantity, Available Units, Low Stock Alerts), and the primary buttons `Create Inventory`, `Stock In Selected`, and `Reset Filters` above the fold.

#### Scenario: Responsive dual-pane layout
- **WHEN** the viewport is desktop width (≥1280px)
- **THEN** the product/variant picker stays in a fixed-width left column while the right column hosts the inventory table and variant detail panel; on narrower screens the picker collapses behind a toggle but remains accessible without leaving the page.

#### Scenario: Reset filters restores defaults
- **WHEN** the admin clicks `Reset Filters`
- **THEN** search text, brand dropdown, low-stock and archived toggles, and catalog filters reset to defaults and the UI re-fetches both the summary stats and the paginated inventory list.

### Requirement: Variant context panel and manual actions
The inventory workspace SHALL keep track of a “selected variant” so manual movements always target the correct `ProductVariant` without re-entering IDs, and it SHALL surface a context panel with key stock details.

#### Scenario: Selection sync across picker and table
- **WHEN** an admin selects a variant from either the catalog card or a row in the inventory table
- **THEN** the context panel updates with product name, variant option labels, SKU, stock metrics (quantity, available, reserved, min/max), low-stock status, and the timestamp of the last manual movement, and all manual action buttons reference that variant by default.

#### Scenario: Manual actions respect selected variant
- **WHEN** the admin invokes `Stock In`, `Stock Out`, `Adjust`, or `Thresholds` using either the global buttons or row actions
- **THEN** the corresponding modal auto-fills the selected variant ID, shows a confirmation of the target variant, and prevents submission if no variant is selected.

#### Scenario: View recent manual movements inline
- **WHEN** the context panel is open
- **THEN** it shows at least the most recent manual movement (type, quantity delta, user, timestamp) and links to the full movement drawer powered by `GET /api/inventory/movements/:variantId`.

### Requirement: Inventory list filtering & pagination
The inventory table SHALL consume server-driven pagination, sorting, and filtering so large catalogs remain navigable and accurate.

#### Scenario: Filter by brand, search, and status
- **WHEN** the admin changes the brand dropdown, toggles “Low stock only” or “Include archived”, or searches by product name/SKU
- **THEN** the UI emits the corresponding query params to the backend, refreshes the list, and highlights the active filters (e.g., chip or badge) so users know the view is constrained.

#### Scenario: Paginate through large inventories
- **WHEN** the dataset exceeds one page (configurable limit, default 10–20 records)
- **THEN** the table shows pagination controls or infinite scroll that request the next page via the backend API while preserving the current selection and scroll position.

### Requirement: Backend inventory filtering API
The backend SHALL enhance `GET /api/inventory` and related DTOs so the redesigned UI receives the data it needs without client-side joins.

#### Scenario: Brand and archived filters
- **WHEN** `GET /api/inventory` receives `brandId=<uuid>` and/or `includeArchived=true`
- **THEN** the response only includes variants belonging to the requested brand and includes archived variants only when explicitly requested, while pagination metadata reflects the filtered total.

#### Scenario: Status filter and sorting
- **WHEN** the query includes `status=low|out|archived` or `sort=available|updatedAt`
- **THEN** the backend applies the corresponding low-stock/out-of-stock/archived filters (low stock defined as available < minStock) and orders the results based on the sort field before returning inventories with quantity, reserved, available, thresholds, and `lastMovementAt`.

#### Scenario: Variant summary payload
- **WHEN** the UI requests either `GET /api/inventory` or `GET /api/inventory/variant/:variantId`
- **THEN** each record includes product metadata (id, name, slug, brand name), variant metadata (id, SKU, option labels, isActive), stock metrics, threshold values, and the latest manual movement summary so the context panel can render without additional queries.

