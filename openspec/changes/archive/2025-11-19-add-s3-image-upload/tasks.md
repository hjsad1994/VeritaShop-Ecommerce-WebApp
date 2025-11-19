## 1. Backend Infrastructure
- [x] 1.1 Install AWS SDK v3 dependencies (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- [x] 1.2 Add AWS configuration to `backend/src/config/index.ts` (region, bucket, CloudFront domain)
- [x] 1.3 Create `backend/src/services/S3Service.ts` with presigned URL generation
- [x] 1.4 Create `backend/src/services/S3Service.ts` with S3 folder deletion method
- [x] 1.5 Create `backend/src/utils/slug.ts` for product slug generation (if not exists)
- [x] 1.6 Add file validation utility (type, size) in `backend/src/utils/fileValidation.ts`

## 2. Backend API Endpoints
- [x] 2.1 Create `backend/src/controllers/ImageController.ts` with presigned URL endpoint
- [x] 2.2 Create `backend/src/routes/imageRoutes.ts` with POST `/api/images/presigned-url`
- [x] 2.3 Add validation middleware for presigned URL request (product-slug, file type, size)
- [x] 2.4 Modify `ProductController.createProduct` to accept image metadata after upload
- [x] 2.5 Modify `ProductController.updateProduct` to handle image add/remove
- [x] 2.6 Modify `ProductService.deleteProduct` to trigger S3 cleanup
- [x] 2.7 Add CloudFront URL transformation in `ProductDto` for all image URLs

## 3. Database & Models
- [x] 3.1 Verify `ProductImage` model supports CloudFront URLs (url field is sufficient)
- [x] 3.2 Update `ProductRepository` to handle image relationships in create/update
- [x] 3.3 Add method to get product slug for S3 path generation

## 4. Frontend Image Upload
- [x] 4.1 Create `frontend/src/lib/api/imageService.ts` for presigned URL and upload APIs
- [x] 4.2 Create `frontend/src/components/admin/ImageUpload.tsx` component
- [x] 4.3 Add image upload UI to `ProductsPage.tsx` (4 slots: 1 main + 3 secondary)
- [x] 4.4 Implement upload flow: select file → get presigned URL → upload to S3 → save metadata
- [x] 4.5 Add image preview and remove functionality
- [x] 4.6 Add file validation on frontend (type, size) before upload
- [x] 4.7 Handle upload progress and error states

## 5. Product Deletion Cleanup
- [x] 5.1 Implement S3 folder deletion in `S3Service.deleteProductFolder(productSlug)`
- [x] 5.2 Add cleanup call in `ProductService.deleteProduct` (before or after DB delete)
- [x] 5.3 Add error handling and logging for cleanup failures
- [ ] 5.4 Consider background job queue for cleanup (optional enhancement)

## 6. Security & Validation
- [x] 6.1 Implement file type validation (jpg, jpeg, png, webp) on backend
- [x] 6.2 Implement file size validation (max 5MB) on backend
- [x] 6.3 Add Content-Type metadata to presigned URLs
- [ ] 6.4 Document IAM role requirements (least privilege: s3:PutObject, s3:DeleteObject)
- [x] 6.5 Add authentication middleware to image upload endpoints

## 7. Testing & Validation
- [ ] 7.1 Test presigned URL generation and expiration
- [ ] 7.2 Test direct S3 upload from browser
- [ ] 7.3 Test image metadata saving to database
- [ ] 7.4 Test CloudFront URL generation and access
- [ ] 7.5 Test product deletion with S3 cleanup
- [ ] 7.6 Test file validation (type, size) rejection
- [ ] 7.7 Test multiple image uploads (up to 4)
- [ ] 7.8 Verify S3 folder structure matches `products/[product-slug]/`

## 8. Documentation
- [ ] 8.1 Document AWS environment variables required
- [ ] 8.2 Document IAM role setup instructions
- [ ] 8.3 Update `openspec/project.md` with S3/CloudFront dependencies
- [ ] 8.4 Add API documentation for new image endpoints

