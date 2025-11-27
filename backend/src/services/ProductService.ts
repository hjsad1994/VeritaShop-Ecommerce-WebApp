import { Product, Prisma } from '@prisma/client';
import { ProductRepository } from '../repositories/ProductRepository';
import {
    CreateVariantData,
    ProductVariantRepository,
    UpdateVariantData,
    VariantImageInput,
    VariantImageUpdateInput,
    VariantInventoryInput,
} from '../repositories/ProductVariantRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import { S3Service } from './S3Service';
import { generateSlug } from '../utils/slug';
import {
    CreateProductData,
    UpdateProductData,
    ProductQueryOptions,
} from '../repositories/ProductRepository';

export interface ProductListResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ProductDetailResponse extends Product {
    brand: any;
    category: any;
    specs: any;
    variants: any[];
    images: any[];
}

const MAX_VARIANT_IMAGES = 5;

export interface VariantImagePayload extends VariantImageInput {}

export interface VariantInventoryPayload extends VariantInventoryInput {}

export interface CreateVariantPayload {
    color: string;
    colorCode?: string | null;
    storage?: string | null;
    ram?: string | null;
    price: number;
    comparePrice?: number | null;
    sku: string;
    isActive?: boolean;
    images?: VariantImagePayload[];
    inventory?: VariantInventoryPayload;
}

export interface UpdateVariantPayload extends Partial<CreateVariantPayload> {
    imageIdsToDelete?: string[];
    existingImages?: VariantImageUpdateInput[];
}

export class ProductService {
    private productRepository: ProductRepository;
    private productVariantRepository: ProductVariantRepository;
    private inventoryRepository: InventoryRepository;
    private s3Service: S3Service;

    constructor(
        productRepository: ProductRepository,
        productVariantRepository: ProductVariantRepository,
        inventoryRepository: InventoryRepository,
        options?: { s3Service?: S3Service }
    ) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryRepository = inventoryRepository;
        this.s3Service = options?.s3Service ?? new S3Service();
    }
    async getAllProducts(options: ProductQueryOptions): Promise<ProductListResponse> {
        try {
            const page = options.page || 1;
            const limit = options.limit || 12;

            const { products, total } = await this.productRepository.findAll({
                ...options,
                page,
                limit
            });

            const totalPages = Math.ceil(total / limit);

            return {
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            logger.error('Error fetching products:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async getProductById(id: string): Promise<ProductDetailResponse> {
        try {
            const product = await this.productRepository.findById(id);

            if (!product) {
                throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            if (!product.isActive) {
                throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            return product as ProductDetailResponse;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Error fetching product by id:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
        try {
            const product = await this.productRepository.findBySlug(slug);

            if (!product) {
                throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            return product as ProductDetailResponse;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Error fetching product by slug:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
        try {
            const validatedLimit = Math.min(Math.max(1, limit), 100);

            const products = await this.productRepository.findFeatured(validatedLimit);

            return products;
        } catch (error) {
            logger.error('Error fetching featured products:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
    async getPopularProducts(limit: number = 8): Promise<Product[]> {
        // TODO: Implement
        // 1. Validate limit (max 100)
        // 2. Call repository.findPopular()
        // 3. Format response
        try {
            const validatedLimit = Math.min(Math.max(1, limit), 100);
            const popularProducts = await this.productRepository.findPopular(validatedLimit);
            return popularProducts;
        } catch (error) {
            logger.error('Error fetching popular products', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR)
        }
    }
    async createProduct(data: CreateProductData): Promise<Product> {
        let uploadedImages: string[] = [];
        
        try {
            // Extract S3 keys from images for potential cleanup
            if (data.images && data.images.length > 0) {
                uploadedImages = data.images.map(img => img.s3Key);
            }
            
            const product = await this.productRepository.create(data);
            
            return product;
        } catch (error) {
            // If product creation failed and images were uploaded, clean them up
            if (uploadedImages.length > 0) {
                logger.warn(`Product creation failed, cleaning up ${uploadedImages.length} uploaded images`);
                // Clean up uploaded images asynchronously (don't block error response)
                this.cleanupUploadedImages(uploadedImages).catch((cleanupError) => {
                    logger.error('Failed to cleanup uploaded images after product creation failure:', cleanupError);
                });
            }
            
            if (error instanceof Error) {
                if (error.message.includes('Brand with id')) {
                    throw new ApiError(404, ERROR_MESSAGES.BRAND_NOT_FOUND);
                }
                if (error.message.includes('Category with id')) {
                    throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                }
                if (error.message.includes('slug') && error.message.includes('already exists')) {
                    // Provide more helpful error message
                    const slug = data.slug || generateSlug(data.name);
                    throw new ApiError(
                        409, 
                        `${ERROR_MESSAGES.PRODUCT_SLUG_EXISTS}. A product with slug "${slug}" already exists. Please use a different name or edit the existing product.`
                    );
                }
                if (error.message.includes('Maximum 4 images')) {
                    throw new ApiError(400, error.message);
                }
                if (error.message.includes('Product must have exactly one') || error.message.includes('Product can only have one')) {
                    throw new ApiError(400, error.message);
                }
            }
            logger.error('Error creating product:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Clean up uploaded images from S3 if product creation fails
     */
    private async cleanupUploadedImages(s3Keys: string[]): Promise<void> {
        const deletePromises = s3Keys.map(key => this.s3Service.deleteFile(key));
        await Promise.all(deletePromises);
        logger.info(`Cleaned up ${s3Keys.length} uploaded images from S3`);
    }

    async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
        let imageKeysToDelete: string[] = [];
        try {
            if (data.imageIdsToDelete && data.imageIdsToDelete.length > 0) {
                imageKeysToDelete = await this.productRepository.getProductImageKeys(id, data.imageIdsToDelete);
            }

            const product = await this.productRepository.update(id, data);

            if (imageKeysToDelete.length > 0) {
                await Promise.all(
                    imageKeysToDelete.map(async (key) => {
                        try {
                            await this.s3Service.deleteFile(key);
                        } catch (error) {
                            logger.error(`Failed to delete image ${key} from S3 during product update:`, error);
                        }
                    })
                );
            }
            
            return product;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Brand with id')) {
                    throw new ApiError(404, ERROR_MESSAGES.BRAND_NOT_FOUND);
                }
                if (error.message.includes('Category with id')) {
                    throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                }
                if (error.message.includes('slug') && error.message.includes('already exists')) {
                    throw new ApiError(409, ERROR_MESSAGES.PRODUCT_SLUG_EXISTS);
                }
                if (error.message.includes('Record to update not found')) {
                    throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                }
            }
            logger.error('Error updating product:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async deleteProduct(id: string): Promise<void> {
        try {
            // Get product to retrieve slug for S3 cleanup
            const product = await this.productRepository.findById(id);
            if (!product) {
                throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            }

            // Delete product from database (soft delete)
            await this.productRepository.delete(id);

            // Clean up S3 folder asynchronously (don't block on failure)
            if (product.slug) {
                this.s3Service.deleteProductFolder(product.slug).catch((error) => {
                    logger.error(`Failed to delete S3 folder for product ${product.slug}:`, error);
                    // Log error but don't throw - product is already deleted from DB
                });
            }
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.message.includes('Record to update not found') || error.message.includes('Record to delete does not exist')) {
                    throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                }
            }
            logger.error('Error deleting product:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async incrementViewCount(id: string): Promise<void> {
        try {
            await this.productRepository.incrementViewCount(id);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Record to update not found')) {
                    throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                }
            }
            logger.error('Error incrementing view count:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    async getProductVariants(productId: string) {
        await this.ensureProductExists(productId, { includeInactive: true });
        return this.productVariantRepository.listByProduct(productId);
    }

    async getProductVariant(productId: string, variantId: string) {
        await this.ensureProductExists(productId, { includeInactive: true });
        const variant = await this.productVariantRepository.findById(productId, variantId);
        if (!variant) {
            throw new ApiError(404, ERROR_MESSAGES.VARIANT_NOT_FOUND);
        }
        return variant;
    }

    async createProductVariant(productId: string, payload: CreateVariantPayload) {
        const product = await this.ensureProductExists(productId, { includeInactive: true });
        await this.ensureSkuUnique(payload.sku);
        
        const existingVariantCount = await this.productVariantRepository.countByProduct(productId);
        const basePrice = Number(product.basePrice);
        this.validateVariantPrice(payload.price, basePrice, existingVariantCount);
        this.assertImageLimit(payload.images?.length ?? 0);

        const createData: CreateVariantData = {
            productId: product.id,
            color: payload.color,
            colorCode: payload.colorCode,
            storage: payload.storage,
            ram: payload.ram,
            price: payload.price,
            comparePrice: payload.comparePrice,
            sku: payload.sku,
            isActive: payload.isActive ?? true,
            images: payload.images,
            inventory: payload.inventory,
        };

        const variant = await this.productVariantRepository.createVariant(createData);
        if (!variant) {
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }

        return variant;
    }

    async updateProductVariant(productId: string, variantId: string, payload: UpdateVariantPayload) {
        const variant = await this.getProductVariant(productId, variantId);

        if (payload.sku && payload.sku !== variant.sku) {
            await this.ensureSkuUnique(payload.sku, variantId);
        }

        if (payload.price !== undefined && payload.price <= 0) {
            throw ApiError.badRequest(ERROR_MESSAGES.VARIANT_PRICE_INVALID);
        }

        const imageIdsToDelete = payload.imageIdsToDelete ?? [];
        const imagesToCreate = payload.images ?? [];
        this.assertImageLimit(
            variant.images.length - imageIdsToDelete.length + imagesToCreate.length
        );

        if (imageIdsToDelete.length) {
            const keys = await this.productVariantRepository.getImageKeys(imageIdsToDelete);
            await this.productVariantRepository.deleteImages(imageIdsToDelete);
            await this.s3Service.deleteFiles(keys);
        }

        const needsPrimaryReset =
            (payload.existingImages?.some((img) => img.isPrimary) ?? false) ||
            imagesToCreate.some((img) => img.isPrimary);

        if (needsPrimaryReset) {
            await this.productVariantRepository.resetPrimaryImage(variantId);
        }

        if (payload.existingImages?.length) {
            await this.productVariantRepository.updateImages(payload.existingImages);
        }

        if (imagesToCreate.length) {
            await this.productVariantRepository.createImages(
                variant.productId,
                variantId,
                imagesToCreate
            );
        }

        const updateData: UpdateVariantData = {
            color: payload.color,
            colorCode: payload.colorCode,
            storage: payload.storage,
            ram: payload.ram,
            price: payload.price,
            comparePrice: payload.comparePrice,
            sku: payload.sku,
            isActive: payload.isActive,
        };

        await this.productVariantRepository.updateVariant(variantId, updateData);

        if (payload.inventory) {
            await this.productVariantRepository.upsertInventory(variantId, payload.inventory);
        }

        const updatedVariant = await this.productVariantRepository.findById(productId, variantId);
        if (!updatedVariant) {
            throw new ApiError(404, ERROR_MESSAGES.VARIANT_NOT_FOUND);
        }

        return updatedVariant;
    }

    async deleteProductVariant(productId: string, variantId: string) {
        const variant = await this.getProductVariant(productId, variantId);

        const imageIds = variant.images.map((img) => img.id);
        const imageKeys = variant.images.map((img) => img.url);

        if (imageIds.length) {
            await this.productVariantRepository.deleteImages(imageIds);
            await this.s3Service.deleteFiles(imageKeys);
        }

        const inventoryRecord = await this.inventoryRepository.findByVariantId(variantId);
        if (!inventoryRecord || (inventoryRecord.quantity <= 0 && inventoryRecord.reserved <= 0)) {
            await this.productVariantRepository.deleteInventory(variantId);
        }

        await this.productVariantRepository.softDeleteVariant(variantId);
    }

    private async ensureProductExists(productId: string, options?: { includeInactive?: boolean }) {
        const product = options?.includeInactive
            ? await this.productRepository.findByIdForAdmin(productId)
            : await this.productRepository.findById(productId);

        if (!product) {
            throw new ApiError(404, ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return product;
    }

    private async ensureSkuUnique(sku: string, excludeVariantId?: string) {
        const existing = await this.productVariantRepository.findBySku(sku, excludeVariantId);
        if (existing) {
            throw new ApiError(409, ERROR_MESSAGES.VARIANT_SKU_EXISTS);
        }
    }

    private validateVariantPrice(price: number, basePrice: number, existingVariantCount: number) {
        if (price <= 0) {
            throw ApiError.badRequest(ERROR_MESSAGES.VARIANT_PRICE_INVALID);
        }

        // First variant price must be <= product base price
        if (existingVariantCount === 0 && price > basePrice) {
            throw ApiError.badRequest(ERROR_MESSAGES.VARIANT_FIRST_PRICE_EXCEEDS_BASE);
        }
    }

    private assertImageLimit(totalImages: number) {
        if (totalImages > MAX_VARIANT_IMAGES) {
            throw ApiError.badRequest(`Mỗi phiên bản chỉ được tối đa ${MAX_VARIANT_IMAGES} ảnh`);
        }
    }
}

