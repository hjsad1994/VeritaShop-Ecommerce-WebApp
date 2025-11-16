import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { ProductDto } from '../dtos/ProductDto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class ProductController {
    private productService = ServiceFactory.getProductService();

    getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 12;
            const brand = req.query.brand as string;
            const category = req.query.category as string;
            const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
            const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
            const search = req.query.search as string;
            const sortBy = req.query.sort as any;

            const result = await this.productService.getAllProducts({
                page,
                limit,
                brand,
                category,
                minPrice,
                maxPrice,
                search,
                sortBy
            });

            const productDtos = ProductDto.fromProductList(result.products as any);

            res.status(200).json({
                success: true,
                data: {
                    products: productDtos,
                    pagination: result.pagination
                }
            });
        } catch (error) {
            next(error);
        }
    };

    getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const product = await this.productService.getProductById(id);

            const productDto = ProductDto.fromProductDetail(product);

            res.status(200).json({
                success: true,
                data: productDto
            });
        } catch (error) {
            next(error);
        }
    };

    getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 8;

            const products = await this.productService.getFeaturedProducts(limit);

            const productDtos = ProductDto.fromProductList(products as any);

            res.status(200).json({
                success: true,
                data: productDtos
            });
        } catch (error) {
            next(error);
        }
    };

    getPopularProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parseInt(req.query.limit as string) || 8;

            const products = await this.productService.getPopularProducts(limit);

            const productDtos = ProductDto.fromProductList(products as any);

            res.status(200).json({
                success: true,
                data: productDtos
            });
        } catch (error) {
            next(error);
        }
    };

    createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const productData = req.body;

            const product = await this.productService.createProduct(productData);

            const productDto = ProductDto.fromProduct(product as any);

            res.status(201).json({
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: productDto
            });
        } catch (error) {
            next(error);
        }
    };

    updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const product = await this.productService.updateProduct(id, updateData);

            const productDto = ProductDto.fromProduct(product as any);

            res.status(200).json({
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data: productDto
            });
        } catch (error) {
            next(error);
        }
    };

    deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.productService.deleteProduct(id);

            res.status(200).json({
                success: true,
                message: 'Xóa sản phẩm thành công'
            });
        } catch (error) {
            next(error);
        }
    };

    incrementViewCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            await this.productService.incrementViewCount(id);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
