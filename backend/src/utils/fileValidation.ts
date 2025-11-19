/**
 * File validation utilities for image uploads
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string, fileName?: string): FileValidationResult {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    };
  }

  // If fileName provided, also check extension
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `File extension not allowed. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number): FileValidationResult {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (fileSize <= 0) {
    return {
      valid: false,
      error: 'File size must be greater than 0',
    };
  }

  return { valid: true };
}

/**
 * Validate both file type and size
 */
export function validateFile(mimeType: string, fileSize: number, fileName?: string): FileValidationResult {
  const typeValidation = validateFileType(mimeType, fileName);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(fileSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return mimeMap[extension.toLowerCase()] || 'application/octet-stream';
}

