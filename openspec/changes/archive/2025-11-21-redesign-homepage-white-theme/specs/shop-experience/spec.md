## MODIFIED Requirements
### Requirement: Shop Product Listing
The Shop Page SHALL display products using their optimized assets and simplified UI.

#### Scenario: Display product card
- **WHEN** user visits `/shop`
- **THEN** the system renders product cards using the `PrimaryImage` loaded directly from S3.
- **AND** the "SALE" tag is NOT displayed on the product card.
- **AND** clicking a product navigates to `/shop/[slug]`.

## ADDED Requirements
### Requirement: Homepage Visual Theme
The Homepage SHALL use a "Light/White" visual theme with high-contrast navigation.

#### Scenario: White Theme with Dark Header
- **WHEN** a user visits the homepage
- **THEN** the main content background SHALL be white or light gray
- **AND** the text SHALL be dark (black/gray) for readability
- **AND** the Header SHALL be distinct (e.g., solid black background) to provide navigation contrast as requested
