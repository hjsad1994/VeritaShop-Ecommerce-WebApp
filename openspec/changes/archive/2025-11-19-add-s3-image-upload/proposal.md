# Change: Add S3 Image Upload System

## Why
The current system uses Cloudinary for image storage, but we need to migrate to AWS S3 with CloudFront for better control, cost optimization, and scalability. The new system must support direct client-to-S3 uploads using presigned URLs for security, organize images by product slug in S3, and automatically clean up images when products are deleted. This change also establishes the foundation for future image optimization features like Lambda@Edge.

## What Changes
- **ADDED**: S3 presigned URL generation service for secure direct client uploads
- **ADDED**: Product image upload capability supporting up to 4 images per product (1 main + 3 secondary)
- **ADDED**: S3 folder structure organized by product slug (`products/[product-slug]/`)
- **ADDED**: CloudFront URL generation and transformation for all image URLs
- **MODIFIED**: Product creation flow to support image uploads via presigned URLs
- **MODIFIED**: Product update flow to support adding/removing images
- **MODIFIED**: Product deletion flow to automatically delete S3 folder contents
- **ADDED**: File validation (type, size limits) on backend before generating presigned URLs
- **ADDED**: IAM role configuration with least-privilege access to S3 bucket

## Impact
- **Affected specs**: 
  - `product-image-upload` (new capability)
  - `product-management` (modified)
  - `product-deletion` (modified)
- **Affected code**:
  - `backend/src/services/` - New S3Service, modified ProductService
  - `backend/src/controllers/` - Modified ProductController, new ImageController
  - `backend/src/routes/` - New image routes
  - `backend/src/config/` - AWS S3 configuration
  - `frontend/src/features/admin/ProductsPage.tsx` - Image upload UI
  - `frontend/src/lib/api/` - Image upload API client
  - Database: ProductImage model already exists, may need CloudFront URL field
- **Breaking changes**: None (Cloudinary can coexist during migration)
- **Dependencies**: 
  - AWS SDK v3 for S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
  - Environment variables: `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DOMAIN`, AWS credentials

