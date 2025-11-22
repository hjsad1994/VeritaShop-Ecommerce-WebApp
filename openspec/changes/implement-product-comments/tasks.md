## 1. Service Layer
- [x] 1.1 Create `src/lib/api/commentService.ts` with methods for `getComments`, `createComment`, `updateComment`, `deleteComment`.
- [x] 1.2 Define TypeScript interfaces for `Comment`, `CommentResponse`, `CreateCommentDTO` in `src/lib/api/types.ts` (or extend existing).

## 2. UI Components
- [x] 2.1 Create `CommentForm.tsx` component (handles input, submit, validation, auth check).
- [x] 2.2 Create `CommentItem.tsx` component (displays avatar, user info, content, date, reply button, nested replies).
- [x] 2.3 Create `CommentSection.tsx` container (fetches data, manages list state, pagination/load more).

## 3. Integration
- [x] 3.1 Integrate `CommentSection` into `src/features/shop/ProductDetail.tsx` below product specs.
- [x] 3.2 Ensure responsive design and matching visual style (Tailwind).

## 4. Verification
- [x] 4.1 Verify viewing comments on a product with existing data.
- [x] 4.2 Verify posting a comment (as logged-in user).
- [x] 4.3 Verify posting a reply to a comment.
- [x] 4.4 Verify that non-logged-in users are prompted to login.
