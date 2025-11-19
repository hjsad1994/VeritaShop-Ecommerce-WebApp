'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import imageService, { ImageMetadata } from '@/lib/api/imageService';
import { generateSlug } from '@/lib/utils/slug';

export interface ImageUploadProps {
  productSlug: string;
  productName?: string;
  maxImages?: number;
  existingImages?: Array<{
    id: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  onImagesChange?: (images: ImageMetadata[]) => void;
  onRemoveImage?: (imageId: string) => void;
  onFilesChange?: (files: File[]) => void; // New: for files before upload
  disabled?: boolean; // Disable upload when submitting
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageUploadRef {
  uploadFiles: (slug: string) => Promise<ImageMetadata[]>;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(function ImageUpload({
  productSlug,
  productName,
  maxImages = 4,
  existingImages = [],
  onImagesChange,
  onRemoveImage,
  onFilesChange,
  disabled = false,
}, ref) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImages, setNewImages] = useState<ImageMetadata[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Store files before upload
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({}); // Preview URLs
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const totalImages = existingImages.length + newImages.length + selectedFiles.length;
  const availableSlots = maxImages - totalImages;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not allowed. Please use JPG, PNG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }
    return null;
  };

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [index]: error }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [index]: previewUrl }));

    // Store file for later upload (when form is submitted)
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated[index] = file;
      return updated;
    });

    // Notify parent about selected files
    if (onFilesChange) {
      setSelectedFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        onFilesChange(updated.filter((f): f is File => f !== undefined));
        return updated;
      });
    }
  };

  // Expose upload function for parent component to call
  useImperativeHandle(ref, () => ({
    uploadFiles: async (slug: string): Promise<ImageMetadata[]> => {
      // Get all files with their indices
      const filesToUpload: Array<{ file: File; index: number }> = [];
      selectedFiles.forEach((file, index) => {
        if (file) {
          filesToUpload.push({ file, index });
        }
      });

      if (filesToUpload.length === 0) return [];

      setUploading(true);
      const uploadedImages: ImageMetadata[] = [];

      try {
        for (const { file, index } of filesToUpload) {
          setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

          try {
            const metadata = await imageService.uploadImage(slug, file);
            uploadedImages.push(metadata);
            setUploadProgress((prev) => ({ ...prev, [index]: 100 }));

            // Clean up preview URL
            if (previewUrls[index]) {
              URL.revokeObjectURL(previewUrls[index]);
            }
          } catch (error: any) {
            console.error(`Upload error for file at index ${index}:`, error);
            setErrors((prev) => ({
              ...prev,
              [index]: error.message || 'Upload failed',
            }));
            throw error; // Re-throw to stop upload process
          }
        }

        // Update state with uploaded images
        setNewImages(uploadedImages);
        setSelectedFiles([]);
        setPreviewUrls({});

        // Notify parent
        if (onImagesChange) {
          onImagesChange(uploadedImages);
        }

        return uploadedImages;
      } finally {
        setUploading(false);
        setUploadProgress({});
      }
    },
  }));

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all preview URLs when component unmounts
      Object.values(previewUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveNewImage = (index: number) => {
    // Remove from uploaded images
    setNewImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (onImagesChange) {
        onImagesChange(updated);
      }
      return updated;
    });

    // Remove from selected files (before upload)
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (onFilesChange) {
        onFilesChange(updated);
      }
      return updated;
    });

    // Clean up preview URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
      setPreviewUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[index];
        return newUrls;
      });
    }

    // Reset file input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }
  };

  const handleRemoveExistingImage = (imageId: string) => {
    if (onRemoveImage) {
      onRemoveImage(imageId);
    }
  };

  const renderImageSlot = (index: number, isPrimary: boolean = false) => {
    // Find existing image at this slot position (considering removed images)
    // We need to map slot index to actual image index
    const existingImage = existingImages[index];
    const newImage = newImages[index];
    const selectedFile = selectedFiles[index];
    const previewUrl = previewUrls[index];
    const isUploading = uploading && uploadProgress[index] !== undefined;
    const error = errors[index];
    const progress = uploadProgress[index];

    return (
      <div key={index} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
        {existingImage ? (
          <>
            <img
              src={existingImage.url}
              alt={existingImage.altText || `Product image ${index + 1}`}
              className="max-w-full max-h-[180px] object-contain rounded"
            />
            <div className="mt-2 flex gap-2">
              {isPrimary && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(existingImage.id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          </>
        ) : newImage ? (
          <>
            <img
              src={newImage.cloudFrontUrl}
              alt="Uploaded"
              className="max-w-full max-h-[180px] object-contain rounded"
            />
            <button
              type="button"
              onClick={() => handleRemoveNewImage(index)}
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
            >
              Remove
            </button>
          </>
        ) : previewUrls[index] ? (
          <>
            <img
              src={previewUrls[index]}
              alt="Preview"
              className="max-w-full max-h-[180px] object-contain rounded"
            />
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                Ready to upload
              </span>
              <button
                type="button"
                onClick={() => handleRemoveNewImage(index)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          </>
        ) : isUploading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-black h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </>
        ) : (
          <>
            <input
              ref={(el) => (fileInputRefs.current[index] = el)}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(index, file);
              }}
              className="hidden"
              id={`image-upload-${index}`}
              disabled={availableSlots <= 0 || disabled}
            />
            <label
              htmlFor={`image-upload-${index}`}
              className={`cursor-pointer flex flex-col items-center ${
                availableSlots <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm text-gray-600">
                {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
              </span>
              <span className="text-xs text-gray-400 mt-1">Click to upload</span>
            </label>
            {error && (
              <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Product Images ({totalImages}/{maxImages})
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Upload up to {maxImages} images. First image will be set as primary.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {(() => {
            // Create slots array: combine existing images, new images, and selected files
            const slots: Array<{
              type: 'existing' | 'new' | 'preview' | 'empty';
              data?: any;
              index: number;
            }> = [];
            
            // Add existing images first
            existingImages.forEach((img, idx) => {
              slots.push({ type: 'existing', data: img, index: idx });
            });
            
            // Add new uploaded images
            newImages.forEach((img, idx) => {
              slots.push({ type: 'new', data: img, index: existingImages.length + idx });
            });
            
            // Add preview images (selected but not yet uploaded)
            selectedFiles.forEach((file, idx) => {
              if (file && previewUrls[idx]) {
                slots.push({ type: 'preview', data: { file, previewUrl: previewUrls[idx] }, index: existingImages.length + newImages.length + idx });
              }
            });
            
            // Fill remaining slots up to maxImages
            while (slots.length < maxImages) {
              slots.push({ type: 'empty', index: slots.length });
            }
            
            // Render slots
            return slots.slice(0, maxImages).map((slot, idx) => {
              if (slot.type === 'existing') {
                return (
                  <div key={`existing-${slot.data.id}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                    <img
                      src={slot.data.url}
                      alt={slot.data.altText || `Product image ${idx + 1}`}
                      className="max-w-full max-h-[180px] object-contain rounded"
                    />
                    <div className="mt-2 flex gap-2">
                      {slot.data.isPrimary && idx === 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(slot.data.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              } else if (slot.type === 'new') {
                return (
                  <div key={`new-${idx}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                    <img
                      src={slot.data.cloudFrontUrl}
                      alt="Uploaded"
                      className="max-w-full max-h-[180px] object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                );
              } else if (slot.type === 'preview') {
                return (
                  <div key={`preview-${idx}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                    <img
                      src={slot.data.previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-[180px] object-contain rounded"
                    />
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Ready to upload
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              } else {
                // Empty slot - render upload input
                return renderImageSlot(idx, idx === 0);
              }
            });
          })()}
        </div>
        {availableSlots <= 0 && totalImages > 0 && (
          <p className="mt-2 text-sm text-yellow-600">
            Maximum {maxImages} images reached. Remove an image to add a new one.
          </p>
        )}
      </div>
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;

