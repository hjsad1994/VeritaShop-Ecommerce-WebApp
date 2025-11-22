## ADDED Requirements
### Requirement: Product Comment System
The Product Detail Page SHALL provide a section for users to view and post comments about the product.

#### Scenario: View comments
- **WHEN** a user views a product detail page
- **THEN** the system displays a list of comments associated with that product
- **AND** comments are ordered by date (newest or oldest based on default)
- **AND** each comment shows the user's name, avatar (if available), content, and timestamp.

#### Scenario: Post a comment (Authenticated)
- **WHEN** a logged-in user submits a comment via the form
- **THEN** the comment is sent to the backend
- **AND** upon success, the comment list is updated to include the new comment
- **AND** the input field is cleared.

#### Scenario: Post a comment (Unauthenticated)
- **WHEN** an unauthenticated user attempts to post a comment
- **THEN** the system prompts the user to log in or redirects to the login page
- **AND** preserves the user's intent (return to product page after login).

#### Scenario: Reply to a comment
- **WHEN** a logged-in user clicks "Reply" on an existing comment
- **THEN** a reply form appears
- **AND** submitting this form creates a new comment linked as a child of the original comment.
