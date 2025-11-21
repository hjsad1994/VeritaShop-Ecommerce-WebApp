## MODIFIED Requirements
### Requirement: Shop Product Listing
The Shop Page SHALL display products with their primary visual assets included in the initial fetch.

#### Scenario: Display product card
- **WHEN** user visits `/shop`
- **THEN** the system renders product cards using the `PrimaryImage` retrieved from the product listing API.
- **AND** the "SALE" tag is NOT displayed on the product card.
- **AND** clicking a product navigates to `/shop/[slug]`.
