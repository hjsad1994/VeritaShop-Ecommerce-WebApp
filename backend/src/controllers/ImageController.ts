import { Request, Response, NextFunction } from 'express';
import { S3Service } from '../services/S3Service';
import { validateFile } from '../utils/fileValidation';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import { logger } from '../utils/logger';

export class ImageController {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  /**
   * Generate presigned URL for image upload
   * POST /api/images/presigned-url
   */
  generatePresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productSlug, fileName, fileType, fileSize } = req.body;

      // Validate required fields
      if (!productSlug || !fileName || !fileType || !fileSize) {
        throw new ApiError(400, 'Missing required fields: productSlug, fileName, fileType, fileSize');
      }

      // Validate file type and size
      const validation = validateFile(fileType, fileSize, fileName);
      if (!validation.valid) {
        throw new ApiError(400, validation.error || 'File validation failed');
      }

      // Generate presigned URL
      const result = await this.s3Service.generatePresignedUrl(
        productSlug,
        fileName,
        fileType
      );

      res.status(200).json({
        success: true,
        data: {
          presignedUrl: result.presignedUrl,
          s3Key: result.s3Key,
          cloudFrontUrl: result.cloudFrontUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

