## ADDED Requirements
### Requirement: Category List Page
The system SHALL provide a dedicated page at `/category` to list product categories.

#### Scenario: Display top categories
- **WHEN** a user visits `/category`
- **THEN** the system displays a list of at least 5 categories fetched from the database
- **AND** each category links to its specific product listing page

### Requirement: Category Product Listing
The Category Detail page (`/category/[slug]`) SHALL fetch and display products dynamically from the backend API based on the URL slug.

#### Scenario: Display products for valid category
- **WHEN** a user visits a category page like `/category/dien-thoai`
- **THEN** the system fetches products belonging to that category slug
- **AND** displays them in a grid similar to the main Shop page
- **AND** filters options (Brand, Price) should ideally work with the API data (or be temporarily disabled if API support is partial)

#### Scenario: Handle unknown category or empty results
- **WHEN** a user visits a category with no products
- **THEN** the system displays a "No products found" message
