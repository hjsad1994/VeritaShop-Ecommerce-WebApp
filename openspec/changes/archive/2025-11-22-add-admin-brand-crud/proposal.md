# Change: Add Brand CRUD Management to Admin Dashboard

## Why
The admin dashboard currently lacks a dedicated interface for managing brands. While the backend API endpoints for brand CRUD operations are fully implemented (GET, POST, PUT, DELETE), administrators need a user-friendly frontend page to:
- View all brands with search and pagination
- Create new brands with logo upload support
- Edit existing brand information
- Delete brands (with product count validation)
- Monitor brand statistics (total brands, total products)

This change addresses the gap between the existing backend capability and the admin user experience, enabling non-technical staff to manage the brand catalog efficiently.

## What Changes
- Create a new admin page at `/admin/brands` for brand management
- Implement a responsive UI matching the existing admin design system (similar to Categories page)
- Add brand listing with search, pagination, and card-based layout
- Create modal forms for adding and editing brands
- Integrate with existing `brandService` API layer
- Display brand statistics (product count per brand, total counts)
- Add validation and error handling for all CRUD operations
- Include loading states and user feedback (toasts)

## Impact
- **Affected specs**: admin-brand-management (new capability)
- **Affected code**: 
  - `frontend/src/app/admin/brands/page.tsx` (new)
  - `frontend/src/features/admin/BrandsPage.tsx` (new)
  - `frontend/src/lib/api/brandService.ts` (already exists, no changes needed)
- **Dependencies**: Existing backend brand API endpoints (already implemented)
- **User roles**: ADMIN and MANAGER roles can access brand management
- **No breaking changes**: This is purely additive functionality
