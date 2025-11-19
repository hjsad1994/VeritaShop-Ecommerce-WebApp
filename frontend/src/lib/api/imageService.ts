import axios from 'axios';
import apiClient from './apiClient';

export interface PresignedUrlRequest {
  productSlug: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface PresignedUrlResponse {
  success: boolean;
  data: {
    presignedUrl: string;
    s3Key: string;
    cloudFrontUrl: string;
  };
}

export interface ImageMetadata {
  s3Key: string;
  cloudFrontUrl: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

class ImageService {
  /**
   * Get presigned URL for direct S3 upload
   */
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    // Use apiClient for consistency with other API calls (handles auth, CORS, etc.)
    const response = await apiClient.post<PresignedUrlResponse>(
      '/images/presigned-url',
      request
    );

    return response.data;
  }

  /**
   * Upload file directly to S3 using presigned URL
   * Note: This is a direct upload to S3, not through our backend
   */
  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    try {
      // Use native fetch or axios for direct S3 upload
      // Don't use apiClient here as this goes directly to S3, not our backend
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        // Don't send credentials to S3
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`S3 upload failed: ${response.status} ${response.statusText}. ${errorText}`);
      }
    } catch (error: any) {
      // If fetch fails, try with axios as fallback
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        // CORS or network error - try with axios
        try {
          await axios.put(presignedUrl, file, {
            headers: {
              'Content-Type': file.type,
            },
            // Don't send credentials to S3
            withCredentials: false,
            // Increase timeout for large files
            timeout: 60000, // 60 seconds
          });
        } catch (axiosError: any) {
          throw new Error(
            `Failed to upload to S3: ${axiosError.response?.status || 'Network error'}. ` +
            `Please check your internet connection and S3 CORS configuration.`
          );
        }
      } else {
        // Re-throw with more context
        const errorMessage = error.message || 'Unknown error during S3 upload';
        throw new Error(
          `S3 upload failed: ${errorMessage}. ` +
          `Please ensure S3 bucket CORS is configured correctly. ` +
          `See backend/S3_CORS_CONFIG.md for setup instructions.`
        );
      }
    }
  }

  /**
   * Upload image with full flow: get presigned URL → upload to S3 → return metadata
   */
  async uploadImage(
    productSlug: string,
    file: File
  ): Promise<ImageMetadata> {
    // 1. Get presigned URL
    const presignedResponse = await this.getPresignedUrl({
      productSlug,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    // 2. Upload to S3
    await this.uploadToS3(presignedResponse.data.presignedUrl, file);

    // 3. Return metadata
    return {
      s3Key: presignedResponse.data.s3Key,
      cloudFrontUrl: presignedResponse.data.cloudFrontUrl,
    };
  }
}

const imageService = new ImageService();
export default imageService;

