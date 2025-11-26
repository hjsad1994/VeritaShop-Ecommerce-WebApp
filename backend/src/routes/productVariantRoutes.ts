import express, { Router } from 'express';
import { ProductVariantController } from '../controllers/ProductVariantController';
import { ProductVariantSentimentController } from '../controllers/ProductVariantSentimentController';
import { authenticate, authorize, validate } from '../middleware';
import { VariantValidation } from '../validations/VariantValidation';

export const createProductVariantRoutes = (): Router => {
  const router = express.Router();
  const controller = new ProductVariantController();
  const sentimentController = new ProductVariantSentimentController();

  router.use(authenticate, authorize('ADMIN', 'MANAGER'));

  router.get('/:productId/variants', controller.list);
  router.get('/:productId/variants/:variantId', controller.getById);
  
  // Sentiment routes
  router.get('/:productId/variants/:variantId/sentiment', sentimentController.getSentiment);
  router.post('/:productId/variants/:variantId/sentiment', sentimentController.upsertSentiment);

  router.post(
    '/:productId/variants',
    validate(VariantValidation.create()),
    controller.create
  );
  router.patch(
    '/:productId/variants/:variantId',
    validate(VariantValidation.update()),
    controller.update
  );
  router.delete('/:productId/variants/:variantId', controller.delete);

  return router;
};

