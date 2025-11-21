# Change: Fix Shop Product Images

## Why
Currently, product images on the Shop page (`/shop`) fall back to a placeholder because the product listing API does not return image data. This degrades the user experience as customers cannot see what they are buying from the main list.

## What Changes
- Update the `ProductRepository` to include product images (specifically the primary image) when fetching the product list.
- Ensure `ProductDto` correctly maps the fetched image to the `primaryImage` field.

## Impact
- **Affected specs**: `shop-experience`
- **Affected code**: 
  - `backend/src/repositories/ProductRepository.ts`
  - `backend/src/controllers/ProductController.ts` (indirectly)
