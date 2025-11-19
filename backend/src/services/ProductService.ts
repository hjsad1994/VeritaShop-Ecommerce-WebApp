import { ProductRepository } from '../repositories/ProductRepository';
import { Product, Prisma } from '@prisma/client';
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

export class ProductService {
    private productRepository: ProductRepository;
    private s3Service: S3Service;

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
        this.s3Service = new S3Service();
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
        try {
            const product = await this.productRepository.update(id, data);
            
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
                if (error.message.includes('Record to update not found')) {
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
}

