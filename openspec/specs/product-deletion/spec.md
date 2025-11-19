# product-deletion Specification

## Purpose
TBD - created by archiving change add-s3-image-upload. Update Purpose after archive.
## Requirements
### Requirement: Product Deletion with S3 Cleanup
When a product is deleted, the system SHALL automatically delete all associated images from S3, including the entire product folder (`products/[product-slug]/`).

#### Scenario: Delete product with images
- **WHEN** admin deletes a product
- **THEN** system identifies product slug
- **AND** system deletes all files in S3 folder `products/[product-slug]/`
- **AND** system deletes ProductImage records from database (via cascade)
- **AND** system deletes Product record from database
- **AND** deletion completes successfully

#### Scenario: S3 cleanup failure handling
- **WHEN** product deletion is initiated
- **AND** S3 folder deletion fails (network error, permissions, etc.)
- **THEN** error is logged with product slug and failure reason
- **AND** database deletion may proceed or be rolled back (implementation decision)
- **AND** admin is notified of cleanup failure for manual intervention

#### Scenario: Delete product without images
- **WHEN** admin deletes product that has no images
- **THEN** S3 cleanup is skipped (no folder exists)
- **AND** product is deleted from database successfully

### Requirement: S3 Cleanup Implementation
S3 cleanup SHALL be performed as a background job or synchronous operation that executes before or during product deletion.

#### Scenario: Synchronous cleanup before deletion
- **WHEN** product deletion is initiated
- **THEN** S3 folder deletion completes before database deletion
- **AND** if S3 deletion fails, database deletion is aborted
- **AND** error is returned to admin

#### Scenario: Background job cleanup
- **WHEN** product deletion is initiated
- **THEN** product is deleted from database immediately
- **AND** background job is queued to delete S3 folder
- **AND** background job retries on failure up to 3 times
- **AND** failures are logged for manual cleanup

