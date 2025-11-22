# Change: Implement Product Comments

## Why
Users currently cannot leave feedback or ask questions about products on the detail page. Enabling comments and replies fosters community engagement, helps users make informed decisions, and provides valuable feedback to the shop owners. The backend already supports this, so this is primarily a frontend implementation task.

## What Changes
- **Add Comment Section**: Integrate a new comment section at the bottom of the Product Detail page (`/shop/[slug]`).
- **Frontend Components**: Create reusable components for `CommentList`, `CommentItem`, and `CommentForm`.
- **Service Integration**: Add `CommentService` to the frontend to communicate with existing backend endpoints.
- **Authentication**: Ensure only logged-in users can post comments or replies.

## Impact
- **Affected specs**: `shop-experience`
- **Affected code**: 
    - `frontend/src/app/shop/[slug]/page.tsx` (or `ProductDetail.tsx`)
    - New components in `frontend/src/features/shop/components/comments/`
    - New service in `frontend/src/lib/api/commentService.ts`
