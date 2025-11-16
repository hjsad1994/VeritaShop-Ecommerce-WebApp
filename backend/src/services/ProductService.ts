import { ProductRepository } from '../repositories/ProductRepository';
import { Product, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
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

    constructor(productRepository: ProductRepository) {
        this.productRepository = productRepository;
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
        try {
            const product = await this.productRepository.create(data);
            
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
            }
            logger.error('Error creating product:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
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
            await this.productRepository.delete(id);
        } catch (error) {
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

