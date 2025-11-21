## MODIFIED Requirements
### Requirement: Product variant CRUD API
The backend SHALL expose authenticated admin endpoints under `/api/admin/products/:productId/variants` to create, read, update, and delete `ProductVariant` records along with their images.

#### Scenario: Create variant succeeds
- **WHEN** an admin with `ADMIN` or `MANAGER` role POSTs color, storage, ram, price, comparePrice, SKU, `isActive`, and optional image metadata to `/api/admin/products/:productId/variants`
- **THEN** the API validates SKU uniqueness + price bounds, creates the variant and associated `ProductImage` rows, seeds an `Inventory` record, recalculates the product’s min/max price, and returns `201` with the new variant payload. (Color Code is NOT accepted).
- **AND** variant images are stored in S3 under `products/[product-slug]/[variant-sku]/[image-name]`.

#### Scenario: Create variant fails validation
- **WHEN** the same endpoint receives missing color, invalid SKU format, or non-positive price
- **THEN** it returns `422` with structured validation errors and does not persist any variant, image, or inventory rows.

#### Scenario: Update variant
- **WHEN** an admin PATCHes `/api/admin/products/:productId/variants/:variantId` with edited fields (price, `isActive`, metadata, images)
- **THEN** the service updates the variant, reconciles attached `ProductImage` entries (add/update/remove), syncs inventory thresholds if provided, updates product price aggregates, and responds `200` with the refreshed variant.

#### Scenario: Delete variant
- **WHEN** an admin DELETEs `/api/admin/products/:productId/variants/:variantId`
- **THEN** the system soft-deletes by marking `isActive=false`, removes orphaned variant images, cascades delete to `Inventory` if quantity is zero, and returns `204`.

### Requirement: Admin variant management UI
The admin dashboard SHALL surface a dedicated interface at `http://localhost:3000/admin/products/:productId/variants` for managing variants.

#### Scenario: View variants table
- **WHEN** an authorized admin opens the variants route
- **THEN** the UI fetches the list endpoint, displays variants in a sortable table with color/storage badges, SKU, price, stock info, and status toggles, and shows empty/skeleton states while loading.

#### Scenario: Create/edit variant form
- **WHEN** the admin clicks “New variant” or selects an existing variant
- **THEN** a drawer/modal opens with forms mirroring backend validation (color, storage, RAM, SKU, pricing, inventory thresholds, image uploads via presigned URLs), shows inline validation errors.
- **AND** the form DOES NOT show a "Color Code (#HEX)" input field.

#### Scenario: Delete or deactivate
- **WHEN** the admin clicks delete or toggles `isActive`
- **THEN** the UI confirms the action, calls the DELETE or PATCH endpoint, updates local state optimistically, and communicates success/error using toast notifications.
