import express, { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { CategoryValidation } from '../validations/CategoryValidation';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware';

export const createCategoryRoutes = (): Router => {
  const router = express.Router();
  const categoryController = new CategoryController();

  // Public routes
  router.get(
    '/',
    validate(CategoryValidation.queryCategories()),
    categoryController.getAllCategories
  );

  router.get(
    '/tree',
    categoryController.getCategoryTree
  );

  router.get(
    '/:id',
    categoryController.getCategoryById
  );

  router.get(
    '/:slug/products',
    categoryController.getCategoryProducts
  );

  // Protected routes - Admin/Manager only
  router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(CategoryValidation.create()),
    categoryController.createCategory
  );

  router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(CategoryValidation.update()),
    categoryController.updateCategory
  );

  // Protected routes - Admin only
  router.delete(
    '/:id',
    authenticate,
    authorize('ADMIN'),
    categoryController.deleteCategory
  );

  return router;
};
