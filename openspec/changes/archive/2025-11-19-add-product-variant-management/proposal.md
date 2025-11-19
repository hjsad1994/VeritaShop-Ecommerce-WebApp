# Change: Product variant CRUD + admin workspace

## Why
Products already model `ProductVariant` rows in Prisma, but there is no API or UI to create, inspect, or update them. Merchandisers must edit the database manually, which is error prone and prevents the admin portal (`/admin`) from presenting accurate stock/pricing options. We need a fully managed variant workflow so every SKU can be curated, priced, and disabled without leaving the app.

## What Changes
- Build authenticated admin REST endpoints to list, create, update, and delete variants under a product, including validation for SKU uniqueness, price ranges, and color/storage metadata.
- Extend services/repositories so variant mutations cascade to inventory records, product price ranges, and associated CloudFront images.
- Implement a Next.js 15 admin experience (`/admin/products/:id/variants`) featuring variant tables, detail panels, and a guided form with image uploads + validations that mirror the backend.
- Add regression coverage (service-level tests and Playwright-style manual checklist) plus docs for new env variables or migrations.

## Impact
- Affected specs: `product-variant-management`
- Affected code: `backend/src/controllers/ProductController.ts`, `backend/src/services/ProductService.ts`, `backend/src/repositories/ProductRepository.ts`, new `Variant` DTO/validation/middleware, Prisma migrations/seed, `frontend/src/app/admin/products/*`, `frontend/src/features/admin/*`, shared API clients, storage helpers, and admin layout nav.

