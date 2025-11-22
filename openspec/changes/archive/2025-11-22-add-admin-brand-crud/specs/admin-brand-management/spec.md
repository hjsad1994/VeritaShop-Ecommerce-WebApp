# Admin Brand Management

## ADDED Requirements

### Requirement: Brand Listing Display
The admin dashboard SHALL display a paginated list of all brands with search capability.

#### Scenario: Administrator views brand list
- **WHEN** an administrator navigates to `/admin/brands`
- **THEN** the system displays all brands in a card-based grid layout with pagination
- **AND** each card shows brand name, slug, logo, description, product count, and creation date

#### Scenario: Administrator searches brands
- **WHEN** an administrator enters text in the search input
- **THEN** the system filters brands by name or slug after 400ms debounce
- **AND** pagination resets to page 1
- **AND** the filtered results are displayed

#### Scenario: Administrator navigates pages
- **WHEN** an administrator clicks next/previous or a page number
- **THEN** the system loads the selected page of brands
- **AND** the pagination controls update to reflect the current page

#### Scenario: No brands exist
- **WHEN** the brand list is empty
- **THEN** the system displays "No brands found" message
- **AND** the "Add Brand" button remains visible

### Requirement: Brand Statistics
The admin dashboard SHALL display aggregated brand statistics.

#### Scenario: Display brand metrics
- **WHEN** the brand management page loads
- **THEN** the system displays two statistics cards:
  - Total Brands: count of all brands in the system
  - Total Products: sum of product counts across all brands
- **AND** each card includes an icon matching the admin design system

### Requirement: Brand Creation
Administrators SHALL be able to create new brands via a modal form.

#### Scenario: Administrator creates brand with required fields
- **WHEN** an administrator clicks "Add Brand"
- **THEN** a modal opens with empty form fields: name (required), description, logo URL, active status
- **WHEN** the administrator fills in the brand name and submits
- **THEN** the system calls `POST /api/brands` with the form data
- **AND** the new brand appears in the list
- **AND** a success toast notification is shown
- **AND** the modal closes

#### Scenario: Brand creation fails due to duplicate slug
- **WHEN** an administrator submits a brand name that generates an existing slug
- **THEN** the system displays error message "Brand slug already exists"
- **AND** the modal remains open for correction
- **AND** the brand list is not modified

#### Scenario: Brand creation with all optional fields
- **WHEN** an administrator provides name, description, logo URL, and sets active status
- **THEN** all fields are saved to the database
- **AND** the brand card displays the logo and full description

### Requirement: Brand Editing
Administrators SHALL be able to edit existing brands via a pre-filled modal form.

#### Scenario: Administrator updates brand information
- **WHEN** an administrator clicks "Edit" on a brand card
- **THEN** a modal opens with form fields pre-filled with current brand data
- **WHEN** the administrator modifies any field and submits
- **THEN** the system calls `PUT /api/brands/:id` with updated data
- **AND** the brand card reflects the changes immediately
- **AND** a success toast notification is shown
- **AND** the modal closes

#### Scenario: Brand update with no changes
- **WHEN** an administrator opens the edit modal but submits without changes
- **THEN** the system still calls the update API (backend handles idempotency)
- **AND** no visual changes occur in the list
- **AND** a success message is shown

### Requirement: Brand Deletion
Administrators SHALL be able to delete brands with validation.

#### Scenario: Administrator deletes brand with no products
- **WHEN** an administrator clicks "Delete" on a brand card with 0 products
- **THEN** a browser confirmation dialog appears: "Are you sure you want to delete this brand?"
- **WHEN** the administrator confirms
- **THEN** the system calls `DELETE /api/brands/:id`
- **AND** the brand is removed from the list
- **AND** a success toast notification is shown

#### Scenario: Brand deletion blocked by existing products
- **WHEN** an administrator attempts to delete a brand that has associated products
- **THEN** the API returns error "Brand has products" with product count
- **AND** the system displays the error message in a toast
- **AND** the brand remains in the list

#### Scenario: Administrator cancels deletion
- **WHEN** an administrator clicks "Delete" but cancels the confirmation dialog
- **THEN** no API call is made
- **AND** the brand remains unchanged in the list

### Requirement: Error Handling
The system SHALL provide clear feedback for all error conditions.

#### Scenario: Network error during brand fetch
- **WHEN** the initial brand list fetch fails due to network error
- **THEN** an error message is displayed: "Failed to load brands."
- **AND** the brand list shows empty state
- **AND** the user can retry by refreshing

#### Scenario: API validation error
- **WHEN** the API returns a validation error (e.g., missing required field)
- **THEN** the error message from the API is displayed in the modal
- **AND** the form remains open for correction

### Requirement: Loading States
The system SHALL indicate loading status for all async operations.

#### Scenario: Loading initial brand list
- **WHEN** the brand management page first loads
- **THEN** a loading indicator is shown while fetching brands
- **AND** the brand cards appear once data is loaded

#### Scenario: Submitting brand form
- **WHEN** an administrator submits the create/edit form
- **THEN** the submit button shows "Saving..." text and is disabled
- **AND** the button returns to normal state after API response

#### Scenario: Deleting brand
- **WHEN** an administrator confirms brand deletion
- **THEN** the delete button for that brand shows loading state
- **AND** other brand actions remain enabled

### Requirement: Responsive Design
The brand management interface SHALL be responsive across device sizes.

#### Scenario: Desktop view
- **WHEN** the page is viewed on desktop (>1024px)
- **THEN** brand cards are displayed in a 3-column grid
- **AND** the modal is centered with max-width 500px

#### Scenario: Tablet view
- **WHEN** the page is viewed on tablet (768px-1024px)
- **THEN** brand cards are displayed in a 2-column grid
- **AND** all functionality remains accessible

#### Scenario: Mobile view
- **WHEN** the page is viewed on mobile (<768px)
- **THEN** brand cards are displayed in a single column
- **AND** the modal takes full width with margin

### Requirement: Authorization
Brand management SHALL be restricted to authorized admin roles.

#### Scenario: Admin or Manager access
- **WHEN** a user with ADMIN or MANAGER role navigates to `/admin/brands`
- **THEN** the brand management page is displayed
- **AND** all CRUD operations are available

#### Scenario: Unauthorized user access
- **WHEN** a user with USER role attempts to access `/admin/brands`
- **THEN** the system redirects to login or shows access denied
- **AND** no brand data is exposed

#### Scenario: Unauthenticated user access
- **WHEN** an unauthenticated user navigates to `/admin/brands`
- **THEN** the system redirects to `/admin/login`
- **AND** the original URL is preserved for post-login redirect
