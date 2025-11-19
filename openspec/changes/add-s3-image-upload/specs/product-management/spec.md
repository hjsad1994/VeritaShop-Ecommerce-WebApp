## ADDED Requirements

### Requirement: Product Creation with Images
The system SHALL support creating products with associated images. Images SHALL be uploaded using presigned URLs before product creation, and image metadata SHALL be linked to the product during creation.

#### Scenario: Create product with images
- **WHEN** admin creates new product
- **AND** admin uploads images using presigned URL flow (select file → get presigned URL → upload to S3 → receive metadata)
- **AND** admin submits product form with image metadata (S3 keys or CloudFront URLs)
- **THEN** product is created in database
- **AND** images are linked to product via ProductImage records
- **AND** first uploaded image is marked as primary (isPrimary=true)

#### Scenario: Create product without images
- **WHEN** admin creates new product without uploading images
- **THEN** product is created successfully
- **AND** product has no associated images
- **AND** product can have images added later via update

### Requirement: Product Update with Images
The system SHALL support adding, removing, and reordering images for existing products.

#### Scenario: Add images to existing product
- **WHEN** admin updates product and uploads new images
- **AND** product currently has fewer than 4 images
- **THEN** new images are uploaded via presigned URL flow
- **AND** image metadata is saved and linked to product
- **AND** existing images remain unchanged

#### Scenario: Remove image from product
- **WHEN** admin removes image from product during update
- **THEN** ProductImage record is deleted from database
- **AND** image file is deleted from S3 (or marked for cleanup)
- **AND** if removed image was primary, next image becomes primary

#### Scenario: Change primary image
- **WHEN** admin designates different image as primary
- **THEN** previous primary image has isPrimary=false
- **AND** new primary image has isPrimary=true
- **AND** sortOrder is updated accordingly

#### Scenario: Reject adding images beyond limit
- **WHEN** admin attempts to add image to product that already has 4 images
- **THEN** system rejects upload with error message

