# Change: Refactor Header to Fetch Categories Dynamically

## Why
The current Header component uses hardcoded mock data for the "Category" dropdown. This needs to be replaced with real data fetched from the database to reflect the actual catalog structure.

## What Changes
- Update frontend `Category` type to support nested children.
- Add `getCategoryTree` method to `CategoryService` (frontend).
- Refactor `Header` component to:
  - Fetch category tree on mount.
  - Render categories dynamically.
  - Handle loading and error states gracefully.

## Impact
- **Affected Specs**: `header` (new capability).
- **Affected Code**:
  - `frontend/src/lib/api/types.ts`
  - `frontend/src/lib/api/categoryService.ts`
  - `frontend/src/components/layout/Header.tsx`
