# product-management Specification

## Purpose
TBD - created by archiving change optimize-product-workflow. Update Purpose after archive.
## Requirements
### Requirement: Single Primary Image for Product
The system SHALL enforce that a Product has exactly one mandatory Primary Image and no other images directly attached to the Product entity (images are attached to Variants).

#### Scenario: Create product with one image
- **WHEN** admin creates a product with exactly 1 image
- **THEN** the system saves it as the `PrimaryImage` and creates the product.

#### Scenario: Create product with multiple images fails
- **WHEN** admin attempts to upload multiple images for the main product
- **THEN** the system rejects the request or the UI prevents the action.

### Requirement: Product Retrieval by Slug
The system SHALL provide a public endpoint to retrieve product details using its unique slug.

#### Scenario: Get product by slug
- **WHEN** a user requests `GET /api/products/slug/:slug`
- **THEN** the system returns product details, brand, category, specs, and a list of variants with up to 5 images each and inventory data.

