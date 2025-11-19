## 1. Backlog grooming
- [x] 1.1 Confirm expected variant attributes (color, storage, ram, pricing, SKU, flags) with stakeholders; capture in validation schema.

## 2. Backend foundations
- [x] 2.1 Create Prisma migration if new indexes/constraints are required (e.g., composite unique on productId + color + storage when SKU omitted).
- [x] 2.2 Add `VariantValidation.ts` plus DTOs for create/update payloads.
- [x] 2.3 Implement repository helpers (listByProduct, findById, createWithImages, updateWithImages, deleteCascade).
- [x] 2.4 Extend `ProductService` with variant CRUD methods that enforce SKU uniqueness, price bounds, and cascade to inventory + product min/max price fields.
- [x] 2.5 Add Express routes & controller handlers under `/api/admin/products/:productId/variants` with auth + validation middleware.
- [x] 2.6 Update seed scripts to create sample variants + inventory rows for demo data.

## 3. Backend verification
- [x] 3.1 Write service-level tests (Jest) covering happy paths and validation failures.
- [x] 3.2 Document manual QA steps for variant CRUD plus inventory sync.

## 4. Frontend admin experience
- [x] 4.1 Create API client helpers (`variantService`) for CRUD endpoints.
- [x] 4.2 Build admin route `/admin/products/[productId]/variants` with table view, filters (color/storage/active), and skeleton states.
- [x] 4.3 Build create/edit drawer or modal with form validation mirroring backend rules, including image upload via `imageService`.
- [x] 4.4 Surface inventory + price summaries per variant and allow toggling `isActive`.
- [x] 4.5 Wire global nav so admins can reach the variants workspace from product detail pages.

## 5. Frontend verification
- [x] 5.1 Add component-level tests (React Testing Library) for the form.
- [x] 5.2 Perform manual smoke test: create variant → verify listing → edit → delete.

## 6. Docs & rollout
- [x] 6.1 Update README/admin handbook with instructions for managing variants.
- [x] 6.2 Run `openspec validate add-product-variant-management --strict` and attach results to the PR.

