## ADDED Requirements
### Requirement: Dynamic Category Navigation
The Header component SHALL fetch and display categories from the backend API instead of using static mock data.

#### Scenario: Display categories
- **WHEN** the Header component loads
- **THEN** it fetches the category tree from the API
- **AND** displays the top-level categories in the "Category" dropdown
- **AND** links each category to `/category/[slug]`

#### Scenario: Handle empty state
- **WHEN** no categories are returned from the API
- **THEN** the Category dropdown should be hidden or display a "No categories" message (or fallback gracefully)
- **NOTE** For this implementation, we will hide the dropdown or show an empty list if no data.
