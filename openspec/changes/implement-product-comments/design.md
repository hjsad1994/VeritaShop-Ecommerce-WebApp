# Design: Product Comments Implementation

## Context
The backend already has a full-featured Comment API (`/api/comments`). The frontend needs to consume this API to display and manage comments on the Product Detail page. The design should be minimal and consistent with the current black/white theme.

## Goals / Non-Goals
- **Goals**:
    - Allow users to view comments for a specific product.
    - Allow authenticated users to post new comments.
    - Allow authenticated users to reply to existing comments (1 level of nesting is standard, but UI should handle the recursive structure if BE supports it).
    - Graceful handling of authentication state (redirect to login if needed).
- **Non-Goals**:
    - Real-time updates (WebSockets) - polling or refresh on interaction is sufficient.
    - Rich text editing (plain text is fine for now).
    - Image uploads in comments (unless BE explicitly supports it and it's simple, but for now we stick to text).

## Decisions
- **State Management**: Local state (React `useState`) within `CommentSection` is sufficient. No need for global Redux/Context for this specific feature unless we want to cache comments aggressively.
- **Pagination**: The API supports pagination. We will implement a "Load More" button or infinite scroll pattern if volume is high. For MVP, standard pagination or "Load More" is fine.
- **Component Structure**:
    - `CommentSection`: Smart component (data fetching).
    - `CommentList`: Presentational.
    - `CommentItem`: Recursive component for replies.
    - `CommentForm`: Reusable for both top-level comments and replies.

## Risks / Trade-offs
- **Risk**: Spam. Mitigation: Backend should have rate limiting (out of scope for this FE task, but good to note).
- **Trade-off**: No optimistic UI updates for now to keep it simple; we will await server response before updating the list to ensure consistency.

## Open Questions
- None. Backend API is verified.
