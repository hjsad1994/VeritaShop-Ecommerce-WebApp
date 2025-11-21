# Change: Fix Frontend Type Errors

## Why
The frontend build (`npx tsc --noEmit`) is currently failing due to strict type errors in `ProductDetail.tsx` and `apiClient.ts`. These errors block the CI/CD pipeline and indicate potential runtime issues (e.g., missing types, implicit anys, invalid spread operations).

Specific errors include:
- Invalid import of `ProductDetailResponse` (does not exist).
- Implicit `any` types for `img` and `variant` parameters.
- Invalid spread usage on a non-object type in `apiClient.ts`.

## What Changes
- **Product Detail Page**:
  - Update imports to use the correct `ProductDetail` interface from `@/lib/api/types`.
  - Add explicit type annotations (`ProductImage`, `ProductVariantItem`) to map callbacks.
  - Resolve naming conflicts between the component and the type by aliasing the type.
- **API Client**:
  - Fix the spread operator usage in the interceptor error handler by casting the error object to `any` (or a specific interface) before spreading, ensuring TypeScript compliance.

## Impact
- **Affected Specs**:
  - `shop-experience` (Product Detail implementation)
  - `frontend-core` (New spec for shared infrastructure like `apiClient`)
- **Affected Code**:
  - `frontend/src/features/shop/ProductDetail.tsx`
  - `frontend/src/lib/api/apiClient.ts`
