## 1. Backend Implementation
- [x] 1.1 Modify `findAll` method in `backend/src/repositories/ProductRepository.ts` to include `images` in the Prisma query (similar to `findFeatured`).
- [x] 1.2 Verify `ProductDto.fromProductList` correctly extracts the primary image from the included images.

## 2. Verification
- [x] 2.1 Restart backend and frontend servers.
- [x] 2.2 Visit `http://localhost:3000/shop` and verify that product images are displayed instead of placeholders.
