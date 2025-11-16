import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { BrandDto } from '../dtos/BrandDto';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

export class BrandController {
    private brandService = ServiceFactory.getBrandService();
    private productService = ServiceFactory.getProductService();

    /**
     * GET /api/brands - Lấy danh sách tất cả brands
     */
    getAllBrands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;

            const result = await this.brandService.getAllBrands({
                page,
                limit,
                search
            });

            // Get product counts for all brands
            const productCounts = new Map<string, number>();
            for (const brand of result.brands) {
                const count = await this.brandService.getBrandProductCount(brand.id);
                productCounts.set(brand.id, count);
            }

            const brandDtos = BrandDto.fromBrandList(result.brands, productCounts);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    brands: brandDtos,
                    pagination: result.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/brands/:slug - Lấy brand theo slug hoặc ID
     */
    getBrandById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;

            const brand = await this.brandService.getBrandById(slug);
            const productCount = await this.brandService.getBrandProductCount(brand.id);

            const brandDto = BrandDto.fromBrand(brand, productCount);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: brandDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/brands/:slug/products - Lấy danh sách sản phẩm của brand
     */
    getBrandProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { slug } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 12;
            const sortBy = req.query.sort as any;

            // Verify brand exists
            const brand = await this.brandService.getBrandById(slug);

            // Get products by brand slug
            const result = await this.productService.getAllProducts({
                page,
                limit,
                brand: brand.slug,
                sortBy
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    brand: BrandDto.fromBrand(brand),
                    products: result.products,
                    pagination: result.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/brands - Tạo brand mới (Admin only)
     */
    createBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const brandData = req.body;

            const brand = await this.brandService.createBrand(brandData);

            const brandDto = BrandDto.fromBrand(brand, 0);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: SUCCESS_MESSAGES.CREATE_BRAND_SUCCESS,
                data: brandDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/brands/:id - Cập nhật brand (Admin only)
     */
    updateBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const brand = await this.brandService.updateBrand(id, updateData);
            const productCount = await this.brandService.getBrandProductCount(brand.id);

            const brandDto = BrandDto.fromBrand(brand, productCount);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATE_BRAND_SUCCESS,
                data: brandDto
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/brands/:id - Xóa brand (Admin only)
     */
    deleteBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.brandService.deleteBrand(id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.DELETE_BRAND_SUCCESS
            });
        } catch (error) {
            next(error);
        }
    };
}
