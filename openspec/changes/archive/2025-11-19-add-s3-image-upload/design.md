# Design: S3 Image Upload System

## Context
We need to replace Cloudinary with AWS S3 + CloudFront for product image storage. The system must support direct browser-to-S3 uploads using presigned URLs for security and performance, organize images by product slug, and automatically clean up when products are deleted.

## Goals / Non-Goals

### Goals
- Secure direct client-to-S3 uploads using presigned URLs
- Organized S3 folder structure by product slug
- Automatic S3 cleanup on product deletion
- CloudFront URLs for all image delivery
- File type and size validation
- Support for 4 images per product (1 main + 3 secondary)
- Foundation for future Lambda@Edge optimization

### Non-Goals
- Migration of existing Cloudinary images (separate task)
- Image optimization/resizing at upload time (future Lambda@Edge)
- Variant-specific images in this phase (ProductImage model supports it, but UI focuses on product-level)

## Decisions

### Decision: Presigned URLs for Direct Upload
**What**: Backend generates presigned PUT URLs, frontend uploads directly to S3
**Why**: 
- Reduces backend load (no proxying large files)
- Better security (AWS credentials never exposed to client)
- Faster uploads (direct to S3)
- Cost efficient (no bandwidth through backend)

**Alternatives considered**:
- Backend proxy upload: Rejected - high bandwidth costs, slower
- Cloudinary: Current solution, being replaced

### Decision: S3 Folder Structure `products/[product-slug]/`
**What**: All product images organized in `products/[product-slug]/` prefix
**Why**:
- Easy to locate all images for a product
- Simple cleanup (delete prefix = delete all product images)
- Clear organization for future features

**Alternatives considered**:
- Flat structure with UUIDs: Rejected - harder to manage and clean up
- Date-based folders: Rejected - unnecessary complexity

### Decision: CloudFront URLs for All Image Access
**What**: All image URLs returned to frontend use CloudFront domain, not S3 direct URLs
**Why**:
- Better performance (CDN caching)
- Lower S3 request costs
- Foundation for Lambda@Edge optimization
- Consistent URL format

**Implementation**: Store S3 key in database, generate CloudFront URL on read

### Decision: Background Job for S3 Cleanup on Delete
**What**: When product deleted, async job deletes S3 folder before/after DB deletion
**Why**:
- Prevents orphaned files
- Ensures consistency
- Can retry on failure

**Alternatives considered**:
- Synchronous deletion: Rejected - slower, blocks API response
- Manual cleanup: Rejected - error-prone

### Decision: File Validation Before Presigned URL
**What**: Backend validates file type and size before generating presigned URL
**Why**:
- Prevents wasted S3 uploads
- Early error feedback
- Security (reject malicious files early)

**Validation rules**:
- Allowed types: jpg, jpeg, png, webp
- Max size: 5MB per file

### Decision: IAM Role with Least Privilege
**What**: Backend IAM role only has `s3:PutObject` and `s3:DeleteObject` on specific bucket prefix
**Why**:
- Security best practice
- Limits blast radius if compromised
- Follows AWS security guidelines

## Risks / Trade-offs

### Risk: Presigned URL Expiration
**Mitigation**: Set reasonable expiration (15 minutes), frontend handles retry if expired

### Risk: S3 Cleanup Failure
**Mitigation**: 
- Log failures for manual cleanup
- Consider S3 lifecycle policies as backup
- Background job with retry logic

### Risk: CloudFront Cache Invalidation
**Mitigation**: 
- Use versioned URLs (query params or path) for cache busting
- Or accept eventual consistency (images update after TTL)

### Trade-off: Async vs Sync Cleanup
**Chosen**: Async cleanup - faster API response, but slight delay in S3 cleanup
**Alternative**: Sync cleanup - slower but immediate consistency

## Migration Plan

### Phase 1: Add S3 Upload (This Change)
- Implement presigned URL generation
- Add image upload to product create/update
- Add S3 cleanup on delete
- New products use S3

### Phase 2: Migrate Existing Images (Future)
- Script to download from Cloudinary
- Upload to S3 with same structure
- Update database URLs to CloudFront
- Remove Cloudinary dependency

## Open Questions
- Should we support image deletion without deleting product? (Yes - via update endpoint)
- Should presigned URLs include metadata (Content-Type)? (Yes - for proper S3 storage)
- CloudFront cache TTL? (Default 24h, can adjust)

