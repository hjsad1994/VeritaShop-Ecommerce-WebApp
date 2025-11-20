## ADDED Requirements
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

