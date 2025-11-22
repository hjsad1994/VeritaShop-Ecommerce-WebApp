# Implementation Tasks

## 1. Backend Repository Fix
- [x] 1.1 Update `CommentRepository.findAll()` to default `parentId` to `null` when not explicitly provided
- [x] 1.2 Ensure the query only fetches root comments (parentId = null) for the main list
- [x] 1.3 Verify that nested replies are still included via the `replies` relation in the Prisma include

## 2. Backend Service Layer Update
- [x] 2.1 Ensure `CommentService.getComments()` passes correct query options to repository
- [x] 2.2 Verify that the service doesn't override the parentId filter unintentionally

## 3. Testing
- [x] 3.1 Test fetching comments without replies (verify only root comments returned)
- [x] 3.2 Test fetching comments with replies (verify nested structure is correct)
- [x] 3.3 Test posting a reply and refetching comments (verify no duplicates appear)
- [x] 3.4 Manual E2E test: Post a comment, post a reply, verify UI displays correctly

## 4. Verification
- [x] 4.1 Run backend tests if available
- [x] 4.2 Test in development environment with real UI interaction
- [x] 4.3 Confirm no regression in existing comment functionality
