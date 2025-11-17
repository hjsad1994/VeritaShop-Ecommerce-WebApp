import { CategoryRepository } from '../repositories/CategoryRepository';
import { Category } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import {
    CreateCategoryData,
    UpdateCategoryData,
    CategoryQueryOptions,
} from '../repositories/CategoryRepository';

export interface CategoryListResponse {
    categories: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ProductQueryOptionsForCategory {
    page?: number;
    limit?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export class CategoryService {
    private categoryRepository: CategoryRepository;

    constructor(categoryRepository: CategoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Lấy danh sách tất cả categories với pagination
     */
    async getAllCategories(options: CategoryQueryOptions): Promise<CategoryListResponse> {
        try {
            const page = options.page || 1;
            const limit = options.limit || 20;

            const { categories, total } = await this.categoryRepository.findAll({
                ...options,
                page,
                limit
            });

            const totalPages = Math.ceil(total / limit);

            return {
                categories,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error: any) {
            logger.error('Error in CategoryService.getAllCategories:', error);
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy category tree (hierarchical structure)
     */
    async getCategoryTree(): Promise<any[]> {
        try {
            // Get all top-level categories with their children
            const categories = await this.categoryRepository.findTopLevel();
            return categories;
        } catch (error: any) {
            logger.error('Error in CategoryService.getCategoryTree:', error);
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy category theo ID hoặc slug
     */
    async getCategoryById(idOrSlug: string): Promise<any> {
        try {
            const category = await this.categoryRepository.findById(idOrSlug);

            if (!category) {
                throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
            }

            return category;
        } catch (error: any) {
            logger.error('Error in CategoryService.getCategoryById:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy category với danh sách products
     */
    async getCategoryWithProducts(
        slugOrId: string,
        productOptions?: ProductQueryOptionsForCategory
    ): Promise<any> {
        try {
            const category = await this.categoryRepository.findWithProducts(slugOrId);

            if (!category) {
                throw new ApiError(404, ERROR_MESSAGES.CATEGORY_NOT_FOUND);
            }

            // Optional: Apply product sorting based on productOptions
            if (productOptions?.sortBy && category.products) {
                const products = category.products;
                switch (productOptions.sortBy) {
                    case 'price_asc':
                        products.sort((a: any, b: any) => parseFloat(a.basePrice.toString()) - parseFloat(b.basePrice.toString()));
                        break;
                    case 'price_desc':
                        products.sort((a: any, b: any) => parseFloat(b.basePrice.toString()) - parseFloat(a.basePrice.toString()));
                        break;
                    case 'popular':
                        products.sort((a: any, b: any) => b.soldCount - a.soldCount);
                        break;
                    case 'newest':
                    default:
                        // Already sorted by createdAt desc in repository
                        break;
                }
            }

            return category;
        } catch (error: any) {
            logger.error('Error in CategoryService.getCategoryWithProducts:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Tạo category mới
     */
    async createCategory(data: CreateCategoryData): Promise<Category> {
        try {
            // Validate data
            this.validateCategoryData(data);

            const category = await this.categoryRepository.create(data);

            logger.info(`Category created successfully: ${category.id} - ${category.name}`);
            return category;
        } catch (error: any) {
            logger.error('Error in CategoryService.createCategory:', error);
            if (error.message === ERROR_MESSAGES.CATEGORY_SLUG_EXISTS) {
                throw new ApiError(409, error.message);
            }
            if (error.message === ERROR_MESSAGES.CATEGORY_PARENT_NOT_FOUND) {
                throw new ApiError(404, error.message);
            }
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Cập nhật category
     */
    async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
        try {
            // Validate data if provided
            if (data.name) {
                this.validateCategoryData({ name: data.name } as CreateCategoryData);
            }

            const category = await this.categoryRepository.update(id, data);

            logger.info(`Category updated successfully: ${category.id} - ${category.name}`);
            return category;
        } catch (error: any) {
            logger.error('Error in CategoryService.updateCategory:', error);
            if (error.message === ERROR_MESSAGES.CATEGORY_NOT_FOUND || error.message === ERROR_MESSAGES.CATEGORY_PARENT_NOT_FOUND) {
                throw new ApiError(404, error.message);
            }
            if (error.message === ERROR_MESSAGES.CATEGORY_SLUG_EXISTS) {
                throw new ApiError(409, error.message);
            }
            if (error.message === ERROR_MESSAGES.CATEGORY_CIRCULAR_REFERENCE || error.message === ERROR_MESSAGES.CATEGORY_CANNOT_BE_OWN_PARENT) {
                throw new ApiError(400, error.message);
            }
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Xóa category (soft delete)
     */
    async deleteCategory(id: string): Promise<Category> {
        try {
            const category = await this.categoryRepository.delete(id);

            logger.info(`Category deleted successfully: ${category.id} - ${category.name}`);
            return category;
        } catch (error: any) {
            logger.error('Error in CategoryService.deleteCategory:', error);
            if (error.message === ERROR_MESSAGES.CATEGORY_NOT_FOUND) {
                throw new ApiError(404, error.message);
            }
            if (error.message.includes(ERROR_MESSAGES.CATEGORY_HAS_PRODUCTS)) {
                throw new ApiError(400, error.message);
            }
            throw new ApiError(500, error.message || ERROR_MESSAGES.INTERNAL_ERROR);
        }
    }

    /**
     * Validate category data
     */
    private validateCategoryData(data: CreateCategoryData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw new ApiError(400, ERROR_MESSAGES.CATEGORY_NAME_REQUIRED);
        }

        if (data.name.trim().length < 2) {
            throw new ApiError(400, ERROR_MESSAGES.CATEGORY_NAME_TOO_SHORT);
        }

        if (data.name.trim().length > 100) {
            throw new ApiError(400, ERROR_MESSAGES.CATEGORY_NAME_TOO_LONG);
        }
    }
}
