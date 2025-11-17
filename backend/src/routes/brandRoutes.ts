import express, { Router } from 'express';
import { BrandController } from '../controllers/BrandController';
import { BrandValidation } from '../validations/BrandValidation';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware';

export const createBrandRoutes = (): Router => {
  const router = express.Router();
  const brandController = new BrandController();

  // Public routes
  router.get(
    '/',
    validate(BrandValidation.queryBrands()),
    brandController.getAllBrands
  );

  router.get(
    '/:slug',
    brandController.getBrandById
  );

  router.get(
    '/:slug/products',
    validate(BrandValidation.queryBrandProducts()),
    brandController.getBrandProducts
  );

  // Protected routes - Admin only
  router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(BrandValidation.create()),
    brandController.createBrand
  );

  router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(BrandValidation.update()),
    brandController.updateBrand
  );

  router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    brandController.deleteBrand
  );

  return router;
};
