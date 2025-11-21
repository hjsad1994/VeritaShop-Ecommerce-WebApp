## ADDED Requirements
### Requirement: Quick quantity update endpoint
The backend SHALL expose an authenticated admin route at `/api/inventory/:variantId/quantity` that allows setting the absolute stock quantity directly.

#### Scenario: Update quantity directly
- **WHEN** an `ADMIN` or `MANAGER` issues `PUT /api/inventory/:variantId/quantity` with `{ quantity: 100 }`
- **THEN** the system updates the inventory quantity to 100, adjusts `available` stock accordingly, creates a stock movement record (type `ADJUSTMENT`), and returns the updated inventory record.
