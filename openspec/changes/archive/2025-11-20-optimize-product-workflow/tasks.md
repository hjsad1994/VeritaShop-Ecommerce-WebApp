## 1. Backend Implementation
- [x] 1.1 Update `ProductVariant` Prisma model to remove `colorCode`. Run migration.
- [x] 1.2 Update `ProductService.createProduct` to enforce single `PrimaryImage` and remove multi-image logic for base product.
- [x] 1.3 Update `ProductService.createProductVariant` and `updateProductVariant` to remove `colorCode` handling.
- [x] 1.4 Update `S3Service` and `ProductService` to implement new upload path `products/[slug]/[sku]/[image]` for variants.
- [x] 1.5 Implement `getProductBySlug` in `ProductService` and `ProductController` returning variant images (limit 5) and inventory.

## 2. Frontend Admin Implementation
- [x] 2.1 Update `ProductsPage` (Add Product) to allow only 1 image upload (Primary) and make it mandatory.
- [x] 2.2 Update `ProductVariantsPage` form to remove "Color Code" input field.

## 3. Frontend Shop Implementation
- [x] 3.1 Update `ShopPage` to render `PrimaryImage` directly from S3 URL and remove "SALE" badge.
- [x] 3.2 Rename `app/shop/[id]` to `app/shop/[slug]` and update routing logic.
- [x] 3.3 Update `ProductDetail` to fetch data using slug API.
- [x] 3.4 Implement logic in `ProductDetail` to display 5 images and inventory when a variant is selected.

## 4. Verification
- [x] 4.1 Verify Add Product flow (1 image).
- [x] 4.2 Verify Add Variant flow (no color code, correct S3 path).
- [x] 4.3 Verify Shop listing (images load, no sale tag).
- [x] 4.4 Verify Product Detail (URL is slug, variant selection updates images/inventory).
