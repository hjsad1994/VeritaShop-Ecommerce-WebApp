# Change: Update Category Page Display and Product Listing

## Why
The user reported two issues:
1.  The `/category/` page currently displays only 3 categories (or doesn't exist as a dedicated page), and they want it to display 5 categories.
2.  The specific category page (e.g., `/category/dien-thoai`) does not display products because it relies on static mock data and hardcoded mappings that don't include "Điện thoại".

## What Changes
-   **Create `/category/` page**: Implement a new page at `frontend/src/app/category/page.tsx` that fetches and displays a list of categories (limit 5).
-   **Refactor Category Detail**: Update `CategoryPage.tsx` to fetch products dynamically from the backend API using the category slug, replacing the legacy mock data implementation.

## Impact
-   **Affected Specs**: `shop-experience`
-   **Affected Code**:
    -   `frontend/src/features/shop/CategoryPage.tsx` (Refactor)
    -   `frontend/src/app/category/page.tsx` (New file)
