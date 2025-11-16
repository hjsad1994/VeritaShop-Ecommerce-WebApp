import { BrandRepository } from '../repositories/BrandRepository';
import { Brand, Product } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import {
    CreateBrandData,
    UpdateBrandData,
    BrandQueryOptions,
} from '../repositories/BrandRepository';

export interface BrandListResponse {
    brands: Brand[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface BrandWithProducts extends Brand {
    products: Product[];
}

export class BrandService {
    private brandRepository: BrandRepository;

    constructor(brandRepository: BrandRepository) {
        this.brandRepository = brandRepository;
    }

    /**
     * Lấy danh sách tất cả brands
     */
    async getAllBrands(options: BrandQueryOptions): Promise<BrandListResponse> {
        try {
            const page = options.page || 1;
            const limit = options.limit || 20;

            const { brands, total } = await this.brandRepository.findAll({
                ...options,
                page,
                limit
            });

            const totalPages = Math.ceil(total / limit);

            return {
                brands,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            logger.error('Error fetching brands:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy brand theo ID hoặc slug
     */
    async getBrandById(id: string): Promise<Brand> {
        try {
            const brand = await this.brandRepository.findById(id);

            if (!brand) {
                throw new ApiError(404, ERROR_MESSAGES.BRAND_NOT_FOUND);
            }

            if (!brand.isActive) {
                throw new ApiError(404, ERROR_MESSAGES.BRAND_NOT_FOUND);
            }

            return brand;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Error fetching brand by id:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Tạo brand mới
     */
    async createBrand(data: CreateBrandData): Promise<Brand> {
        try {
            const brand = await this.brandRepository.create(data);
            
            logger.info(`Brand created successfully: ${brand.name}`);
            return brand;
        } catch (error: any) {
            logger.error('Error creating brand:', error);
            if (error.message === ERROR_MESSAGES.BRAND_SLUG_EXISTS) {
                throw new ApiError(409, error.message);
            }
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Cập nhật brand
     */
    async updateBrand(id: string, data: UpdateBrandData): Promise<Brand> {
        try {
            const brand = await this.brandRepository.update(id, data);
            
            logger.info(`Brand updated successfully: ${brand.name}`);
            return brand;
        } catch (error: any) {
            logger.error('Error updating brand:', error);
            if (error.message === ERROR_MESSAGES.BRAND_SLUG_EXISTS) {
                throw new ApiError(409, error.message);
            }
            if (error.message === ERROR_MESSAGES.BRAND_NOT_FOUND) {
                throw new ApiError(404, error.message);
            }
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Xóa brand (soft delete)
     */
    async deleteBrand(id: string): Promise<void> {
        try {
            // Check if brand exists
            const brand = await this.brandRepository.findById(id);
            if (!brand) {
                throw new ApiError(404, ERROR_MESSAGES.BRAND_NOT_FOUND);
            }

            // Check if brand has products
            const productCount = await this.brandRepository.getProductCount(id);
            if (productCount > 0) {
                throw new ApiError(400, `${ERROR_MESSAGES.BRAND_HAS_PRODUCTS} (${productCount} sản phẩm)`);
            }

            await this.brandRepository.delete(id);
            
            logger.info(`Brand soft deleted: ${brand.name}`);
        } catch (error: any) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('Error deleting brand:', error);
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy số lượng sản phẩm của brand
     */
    async getBrandProductCount(brandId: string): Promise<number> {
        try {
            const count = await this.brandRepository.getProductCount(brandId);
            return count;
        } catch (error) {
            logger.error('Error getting brand product count:', error);
            throw new ApiError(500, ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }
}
