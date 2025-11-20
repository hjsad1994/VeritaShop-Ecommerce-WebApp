import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { ProductVariantDto } from '../dtos/ProductVariantDto';
import { logger } from '../utils/logger';

export class ProductVariantController {
  private productService = ServiceFactory.getProductService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const variants = await this.productService.getProductVariants(productId);
      res.status(200).json({
        success: true,
        data: ProductVariantDto.fromVariantList(variants as any),
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, variantId } = req.params;
      const variant = await this.productService.getProductVariant(productId, variantId);
      res.status(200).json({
        success: true,
        data: ProductVariantDto.fromVariant(variant as any),
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const payload = req.body;
      const variant = await this.productService.createProductVariant(productId, payload);
      res.status(201).json({
        success: true,
        data: ProductVariantDto.fromVariant(variant as any),
      });
    } catch (error) {
      logger.error('Failed to create variant', error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, variantId } = req.params;
      const payload = req.body;
      const variant = await this.productService.updateProductVariant(productId, variantId, payload);
      res.status(200).json({
        success: true,
        data: ProductVariantDto.fromVariant(variant as any),
      });
    } catch (error) {
      logger.error('Failed to update variant', error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, variantId } = req.params;
      await this.productService.deleteProductVariant(productId, variantId);
      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete variant', error);
      next(error);
    }
  };
}

