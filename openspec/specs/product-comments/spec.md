# product-comments Specification

## Purpose
TBD - created by archiving change fix-comment-reply-display. Update Purpose after archive.
## Requirements
### Requirement: Root Comments Query
The system SHALL fetch only root-level comments (where parentId is null) by default when retrieving comments for a product, with nested replies included in each root comment's replies array.

#### Scenario: Fetch root comments with nested replies
- **WHEN** the API receives a GET request to `/api/comments?productId=xyz` without specifying parentId
- **THEN** the system SHALL return only comments where parentId is null
- **AND** each root comment SHALL include its nested replies in the replies array
- **AND** reply comments SHALL NOT appear as separate top-level items in the response

#### Scenario: Display comments in UI without duplication
- **WHEN** a user views a product detail page with comments and replies
- **THEN** each reply SHALL appear only once, nested under its parent comment
- **AND** replies SHALL NOT appear as duplicate standalone comments
- **AND** the comment tree structure SHALL be properly maintained

### Requirement: Reply Creation and Refresh
The system SHALL properly handle reply creation and subsequent comment list refresh without showing duplicate replies.

#### Scenario: Post a reply and refresh comments
- **WHEN** a user posts a reply to an existing comment
- **AND** the frontend refreshes the comment list
- **THEN** the new reply SHALL appear nested under its parent comment
- **AND** the reply SHALL NOT appear as a separate root-level comment
- **AND** all existing comments and replies SHALL maintain their proper nesting structure

### Requirement: Explicit Reply Filtering
The system SHALL allow explicit filtering of comments by parentId when needed for advanced queries.

#### Scenario: Fetch replies for a specific comment
- **WHEN** the API receives a GET request with a specific parentId parameter
- **THEN** the system SHALL return only comments with that parentId
- **AND** the results SHALL include the nested replies structure

#### Scenario: Fetch all comments regardless of hierarchy
- **WHEN** the API receives a request with explicit override to fetch all comments
- **THEN** the system SHALL return all comments including both root and reply comments
- **AND** the hierarchical structure SHALL still be preserved in the response

