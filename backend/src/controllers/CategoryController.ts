import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { CategoryDto } from '../dtos/CategoryDto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class CategoryController {
    private categoryService = ServiceFactory.getCategoryService();

    /**
     * GET /api/categories
     * Lấy danh sách tất cả categories
     */
    getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;
            const includeChildren = req.query.includeChildren === 'true';

            const result = await this.categoryService.getAllCategories({
                page,
                limit,
                search,
                includeChildren
            });

            const categoryDtos = CategoryDto.fromCategoryList(result.categories);

            res.status(200).json({
                success: true,
                data: {
                    categories: categoryDtos,
                    pagination: result.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/categories/tree
     * Lấy category tree (hierarchical structure)
     */
    getCategoryTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categories = await this.categoryService.getCategoryTree();
            const categoryDtos = CategoryDto.fromCategoryTree(categories);

            res.status(200).json({
                success: true,
                data: categoryDtos
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/categories/:id
     * Lấy category theo ID hoặc slug
     */
    getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const category = await this.categoryService.getCategoryById(id);
            const categoryDto = CategoryDto.fromCategory(category);

            res.status(200).json({
                success: true,
                data: categoryDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/categories/:slug/products
     * Lấy category với danh sách products
     */
    getCategoryProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const sortBy = req.query.sort as any;

            const category = await this.categoryService.getCategoryWithProducts(slug, {
                sortBy
            });

            const categoryDto = CategoryDto.fromCategory(category);

            res.status(200).json({
                success: true,
                data: categoryDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/categories
     * Tạo category mới (Admin/Manager only)
     */
    createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, description, image, parentId } = req.body;

            const category = await this.categoryService.createCategory({
                name,
                description,
                image,
                parentId
            });

            const categoryDto = CategoryDto.fromCategory(category as any);

            res.status(201).json({
                success: true,
                message: SUCCESS_MESSAGES.CREATE_CATEGORY_SUCCESS,
                data: categoryDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/categories/:id
     * Cập nhật category (Admin/Manager only)
     */
    updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { name, description, image, parentId, isActive } = req.body;

            const category = await this.categoryService.updateCategory(id, {
                name,
                description,
                image,
                parentId,
                isActive
            });

            const categoryDto = CategoryDto.fromCategory(category as any);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATE_CATEGORY_SUCCESS,
                data: categoryDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/categories/:id
     * Xóa category (Admin only)
     */
    deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.categoryService.deleteCategory(id);

            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETE_CATEGORY_SUCCESS
            });
        } catch (error) {
            next(error);
        }
    };
}
