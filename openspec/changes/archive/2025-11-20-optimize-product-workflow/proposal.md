# Change: Optimize Product Workflow & Shop Experience

## Why
To improve data consistency, system performance, and user experience, we are streamlining the product creation process and upgrading the frontend display. Storing images hierarchically in S3 improves organization. Using slugs for URLs is better for SEO and user readability.

## What Changes
- **Backend**:
    - `Product` entity now only accepts a SINGLE `PrimaryImage` (mandatory).
    - `ProductVariant` no longer uses `colorCode` (removed).
    - S3 Image Uploads for variants now use path: `products/[product-slug]/[variant-SKU]/[image-name]`.
    - New API endpoints to get Product by Slug (including 5 variant images & inventory).
- **Frontend**:
    - "Add Product" form restricts main product image to 1.
    - Variant forms remove "Color Code" input.
    - Shop Page (`/shop`) displays `PrimaryImage` from S3 and removes "SALE" tag.
    - Product Detail Page moves to `/shop/[slug]` and shows variant-specific content.

## Impact
- **Affected Specs**: `product-management`, `product-variant-management`, `shop-experience`.
- **Affected Code**:
    - Backend: `ProductController`, `ProductService`, `S3Service`, `ProductVariant` model.
    - Frontend: `Admin/ProductsPage`, `Admin/ProductVariantsPage`, `ShopPage`, `ProductDetail`, `App Router`.
