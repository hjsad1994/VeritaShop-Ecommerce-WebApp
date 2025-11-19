import { Router } from 'express';
import { ImageController } from '../controllers/ImageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { body } from 'express-validator';

export function createImageRoutes(): Router {
  const router = Router();
  const imageController = new ImageController();

  // Validation rules for presigned URL request
  const presignedUrlValidation = [
    body('productSlug')
      .notEmpty()
      .withMessage('Product slug is required')
      .isString()
      .withMessage('Product slug must be a string')
      .trim(),
    body('fileName')
      .notEmpty()
      .withMessage('File name is required')
      .isString()
      .withMessage('File name must be a string')
      .trim(),
    body('fileType')
      .notEmpty()
      .withMessage('File type is required')
      .isString()
      .withMessage('File type must be a string')
      .isIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
      .withMessage('File type must be jpeg, jpg, png, or webp'),
    body('fileSize')
      .notEmpty()
      .withMessage('File size is required')
      .isInt({ min: 1, max: 5 * 1024 * 1024 })
      .withMessage('File size must be between 1 byte and 5MB'),
  ];

  // POST /api/images/presigned-url - Generate presigned URL for image upload
  router.post(
    '/presigned-url',
    authenticate,
    validate(presignedUrlValidation),
    imageController.generatePresignedUrl
  );

  return router;
}

