import { Request, Response, NextFunction } from 'express';
import { ProductVariantSentimentService } from '../services/ProductVariantSentimentService';
import { RepositoryFactory } from '../repositories';
import { HTTP_STATUS } from '../constants';

export class ProductVariantSentimentController {
  private sentimentService: ProductVariantSentimentService;

  constructor() {
    this.sentimentService = new ProductVariantSentimentService(
      RepositoryFactory.getProductVariantSentimentRepository()
    );
  }

  getSentiment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const sentiment = await this.sentimentService.getSentimentByVariantId(variantId);
      
      if (!sentiment) {
        res.status(HTTP_STATUS.OK).json({ data: null });
        return;
      }

      res.status(HTTP_STATUS.OK).json({ data: sentiment });
    } catch (error) {
      next(error);
    }
  };

  upsertSentiment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantId } = req.params;
      const sentiment = await this.sentimentService.upsertSentiment({
        variantId,
        ...req.body
      });

      res.status(HTTP_STATUS.OK).json({ data: sentiment });
    } catch (error) {
      next(error);
    }
  };
}
