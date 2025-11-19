'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
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

type ExistingProductImage = NonNullable<ImageUploadProps['existingImages']>[number];

type ImageSlot =
  | { type: 'existing'; data: ExistingProductImage; index: number }
  | { type: 'new'; data: ImageMetadata; index: number }
  | { type: 'preview'; data: { previewUrl: string }; index: number }
  | { type: 'empty'; index: number };

const filterDefinedFiles = (files: Array<File | undefined>): File[] =>
  files.filter((file): file is File => Boolean(file));

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageUploadRef {
  uploadFiles: (slug?: string) => Promise<ImageMetadata[]>;
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
  const [selectedFiles, setSelectedFiles] = useState<Array<File | undefined>>([]); // Store files before upload
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({}); // Preview URLs
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedFileCount = useMemo(
    () => filterDefinedFiles(selectedFiles).length,
    [selectedFiles]
  );
  const totalImages = existingImages.length + newImages.length + selectedFileCount;
  const availableSlots = maxImages - totalImages;

  const resolvedProductSlug = useMemo(() => {
    if (productSlug) {
      return productSlug;
    }
    if (productName) {
      return generateSlug(productName);
    }
    return '';
  }, [productName, productSlug]);

  const slots = useMemo<ImageSlot[]>(() => {
    const slotList: ImageSlot[] = [];

    existingImages.forEach((image, idx) => {
      slotList.push({ type: 'existing', data: image, index: idx });
    });

    newImages.forEach((image, idx) => {
      slotList.push({ type: 'new', data: image, index: idx });
    });

    selectedFiles.forEach((file, idx) => {
      if (file && previewUrls[idx]) {
        slotList.push({
          type: 'preview',
          data: { previewUrl: previewUrls[idx] },
          index: idx,
        });
      }
    });

    while (slotList.length < maxImages) {
      slotList.push({ type: 'empty', index: slotList.length });
    }

    return slotList.slice(0, maxImages);
  }, [existingImages, maxImages, newImages, previewUrls, selectedFiles]);

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

    // Store file for later upload (when form is submitted) and notify parent
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated[index] = file;
      if (onFilesChange) {
        onFilesChange(filterDefinedFiles(updated));
      }
      return updated;
    });
  };

  // Expose upload function for parent component to call
  useImperativeHandle(ref, () => ({
    uploadFiles: async (slug?: string): Promise<ImageMetadata[]> => {
      // Get all files with their indices
      const filesToUpload: Array<{ file: File; index: number }> = [];
      selectedFiles.forEach((file, index) => {
        if (file) {
          filesToUpload.push({ file, index });
        }
      });

      if (filesToUpload.length === 0) return [];

      const targetSlug = (slug || resolvedProductSlug).trim();
      if (!targetSlug) {
        throw new Error('Product slug is required to upload images.');
      }

      setUploading(true);
      const uploadedImages: ImageMetadata[] = [];

      try {
        for (const { file, index } of filesToUpload) {
          setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

          try {
            const metadata = await imageService.uploadImage(targetSlug, file);
            uploadedImages.push(metadata);
            setUploadProgress((prev) => ({ ...prev, [index]: 100 }));

            // Clean up preview URL
            if (previewUrls[index]) {
              URL.revokeObjectURL(previewUrls[index]);
            }
          } catch (error: unknown) {
            console.error(`Upload error for file at index ${index}:`, error);
            setErrors((prev) => ({
              ...prev,
              [index]: error instanceof Error ? error.message : 'Upload failed',
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

  const handleRemoveUploadedImage = (index: number) => {
    setNewImages((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }
      const updated = prev.filter((_, i) => i !== index);
      if (onImagesChange) {
        onImagesChange(updated);
      }
      return updated;
    });
  };

  const handleRemovePendingImage = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index]);
      }
      updated[index] = undefined;
      if (onFilesChange) {
        onFilesChange(filterDefinedFiles(updated));
      }
      return updated;
    });

    setPreviewUrls((prev) => {
      if (!prev[index]) {
        return prev;
      }
      const newUrls = { ...prev };
      delete newUrls[index];
      return newUrls;
    });

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = '';
    }

    setErrors((prev) => {
      if (!prev[index]) {
        return prev;
      }
      const updatedErrors = { ...prev };
      delete updatedErrors[index];
      return updatedErrors;
    });
  };

  const handleRemoveExistingImage = (imageId: string) => {
    if (onRemoveImage) {
      onRemoveImage(imageId);
    }
  };

  const renderImageSlot = (index: number, isPrimary: boolean = false) => {
    const isUploading = uploading && uploadProgress[index] !== undefined;
    const error = errors[index];
    const progress = uploadProgress[index];

    return (
      <div key={`empty-slot-${index}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
        {isUploading ? (
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
              ref={(el) => {
                fileInputRefs.current[index] = el;
              }}
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
                {isPrimary ? 'Primary Image' : `Image ${index + 1}`}
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
          {slots.map((slot, slotPosition) => {
            if (slot.type === 'existing') {
              return (
                <div key={`existing-${slot.data.id}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={slot.data.url}
                      alt={slot.data.altText || `Product image ${slotPosition + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {slot.data.isPrimary && (
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
            }

            if (slot.type === 'new') {
              return (
                <div key={`new-${slotPosition}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={slot.data.cloudFrontUrl}
                      alt="Uploaded"
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedImage(slot.index)}
                    className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              );
            }

            if (slot.type === 'preview') {
              return (
                <div key={`preview-${slotPosition}`} className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={slot.data.previewUrl}
                      alt="Preview"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      Ready to upload
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingImage(slot.index)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            }

            return renderImageSlot(slotPosition, slotPosition === 0);
          })}
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

