import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config';
import { logger } from '../utils/logger';
import { generateSlug } from '../utils/slug';

export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private cloudFrontDomain: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
    });
    this.bucket = config.aws.s3Bucket;
    this.cloudFrontDomain = config.aws.cloudFrontDomain;
  }

  /**
   * Generate presigned URL for direct client-to-S3 upload
   * @param productSlug - Product slug for folder structure
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param expiresIn - URL expiration time in seconds (default: 15 minutes)
   * @returns Presigned URL and S3 key
   */
  async generatePresignedUrl(
    productSlug: string,
    fileName: string,
    contentType: string,
    expiresIn: number = 15 * 60 // 15 minutes
  ): Promise<{ presignedUrl: string; s3Key: string; cloudFrontUrl: string }> {
    try {
      // Generate slug-safe product folder name
      const slug = generateSlug(productSlug);
      
      // Generate unique file name with timestamp to avoid collisions
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const sanitizedFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // S3 key: products/[product-slug]/[filename]
      const s3Key = `products/${slug}/${sanitizedFileName}`;

      // Create PutObject command
      // Note: S3 bucket must have CORS configured to allow PUT requests from the frontend origin
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        ContentType: contentType,
        // Add ACL if needed (optional, depends on bucket policy)
        // ACL: 'public-read', // Only if bucket allows public access
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      // Generate CloudFront URL
      const cloudFrontUrl = this.getCloudFrontUrl(s3Key);

      logger.info(`Generated presigned URL for ${s3Key}`);

      return {
        presignedUrl,
        s3Key,
        cloudFrontUrl,
      };
    } catch (error) {
      logger.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Delete all files in a product folder
   * @param productSlug - Product slug
   */
  async deleteProductFolder(productSlug: string): Promise<void> {
    try {
      const slug = generateSlug(productSlug);
      const folderPrefix = `products/${slug}/`;

      logger.info(`Deleting S3 folder: ${folderPrefix}`);

      // List all objects in the folder
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: folderPrefix,
      });

      const listResponse = await this.s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        logger.info(`No files found in folder: ${folderPrefix}`);
        return;
      }

      // Delete all objects
      const deletePromises = listResponse.Contents.map((object) => {
        if (!object.Key) return Promise.resolve();
        
        const deleteCommand = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: object.Key,
        });
        
        return this.s3Client.send(deleteCommand);
      });

      await Promise.all(deletePromises);

      logger.info(`Successfully deleted ${listResponse.Contents.length} files from ${folderPrefix}`);
    } catch (error) {
      logger.error(`Error deleting S3 folder for product ${productSlug}:`, error);
      throw new Error(`Failed to delete S3 folder for product: ${productSlug}`);
    }
  }

  /**
   * Delete a specific file from S3
   * @param s3Key - S3 key of the file to delete
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      await this.s3Client.send(deleteCommand);
      logger.info(`Successfully deleted file: ${s3Key}`);
    } catch (error) {
      logger.error(`Error deleting file ${s3Key}:`, error);
      throw new Error(`Failed to delete file: ${s3Key}`);
    }
  }

  /**
   * Convert S3 key to CloudFront URL
   * @param s3Key - S3 key
   * @returns CloudFront URL
   */
  getCloudFrontUrl(s3Key: string): string {
    return `https://${this.cloudFrontDomain}/${s3Key}`;
  }

  /**
   * Extract S3 key from CloudFront URL
   * @param cloudFrontUrl - CloudFront URL
   * @returns S3 key or null if invalid
   */
  extractS3KeyFromCloudFrontUrl(cloudFrontUrl: string): string | null {
    try {
      const url = new URL(cloudFrontUrl);
      if (url.hostname === this.cloudFrontDomain) {
        // Remove leading slash
        return url.pathname.substring(1);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

