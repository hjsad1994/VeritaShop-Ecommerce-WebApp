# S3 CORS Configuration

For direct browser-to-S3 uploads to work, the S3 bucket must have CORS (Cross-Origin Resource Sharing) configured.

## Required CORS Configuration

Add the following CORS configuration to your S3 bucket `verita-phone-store-assets1`:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://demo-shop.honeysocial.click"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## How to Configure CORS in AWS Console

1. Go to AWS S3 Console
2. Select your bucket: `verita-phone-store-assets1`
3. Click on the "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Paste the JSON configuration above
7. Update `AllowedOrigins` with your actual frontend domain(s)
8. Click "Save changes"

## Important Notes

- Replace `http://localhost:3000` with your actual frontend URL in production
- Add all domains that will access the S3 bucket
- The `AllowedMethods` must include `PUT` for presigned URL uploads
- `AllowedHeaders` can be `["*"]` to allow all headers, or specify: `["Content-Type", "Authorization", "x-amz-*"]`

## Testing CORS

After configuring CORS, test the upload again. If you still see CORS errors in the browser console, verify:
1. The origin in CORS config matches your frontend URL exactly
2. The bucket policy allows the operations
3. The presigned URL is valid and not expired
