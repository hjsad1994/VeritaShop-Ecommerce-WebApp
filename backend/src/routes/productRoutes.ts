import express, { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductValidation } from '../validations/ProductValidation';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware';

export const createProductRoutes = (): Router => {
  const router = express.Router();
  const productController = new ProductController();

  // Public routes
  router.get(
    '/',
    validate(ProductValidation.queryProducts()),
    productController.getAllProducts
  );

  router.get(
    '/featured',
    validate(ProductValidation.queryLimit()),
    productController.getFeaturedProducts
  );

  router.get(
    '/popular',
    validate(ProductValidation.queryLimit()),
    productController.getPopularProducts
  );

  router.get(
    '/slug/:slug',
    productController.getProductBySlug
  );

  router.get(
    '/:id',
    productController.getProductById
  );

  router.post(
    '/:id/view',
    productController.incrementViewCount
  );

  // Protected routes - Admin/Manager only
  router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(ProductValidation.create()),
    productController.createProduct
  );

  router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(ProductValidation.update()),
    productController.updateProduct
  );

  // Protected routes - Admin only
  router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    productController.deleteProduct
  );

  return router;
};
