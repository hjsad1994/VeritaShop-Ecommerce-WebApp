# Change: Fix Comment Reply Display Bug

## Why
The comment section displays duplicate replies when users post a reply. When clicking "Reply" and submitting a reply, all replies appear duplicated in the UI - they show both nested under their parent comment AND as standalone top-level items. This creates a confusing user experience where the same comment appears multiple times on the page.

The root cause is that the backend's `CommentRepository.findAll()` method returns ALL comments (including replies) when the frontend expects only root-level comments (where `parentId` is null) with their nested replies included.

## What Changes
- Modify the backend `CommentRepository.findAll()` to default to fetching only root comments (parentId = null) unless explicitly specified otherwise
- Update the query logic to ensure replies are only included as nested data within their parent comments, not as separate top-level items
- Ensure the comment fetching maintains proper hierarchical structure: root comments contain their replies array

## Impact
- Affected specs: `product-comments` (new capability spec)
- Affected code:
  - `backend/src/repositories/CommentRepository.ts` - Update `findAll()` method logic
  - `backend/src/services/CommentService.ts` - Pass correct query options
  - Frontend remains unchanged (already expects correct structure)
