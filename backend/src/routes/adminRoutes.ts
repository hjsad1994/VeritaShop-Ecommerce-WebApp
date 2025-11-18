import express, { Router } from 'express';
import { AdminUserController } from '../controllers/AdminUserController';
import { authenticate, authorize, validate } from '../middleware';
import { UserValidation } from '../validations/UserValidation';

export const createAdminRoutes = (): Router => {
  const router = express.Router();
  const adminUserController = new AdminUserController();

  router.get('/users', authenticate, authorize('ADMIN', 'MANAGER'), adminUserController.getUsers);
  router.post(
    '/users',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(UserValidation.adminCreate()),
    adminUserController.createUser
  );
  router.get('/users/:id', authenticate, authorize('ADMIN', 'MANAGER'), adminUserController.getUserById);
  router.put(
    '/users/:id',
    authenticate,
    authorize('ADMIN', 'MANAGER'),
    validate(UserValidation.adminUpdate()),
    adminUserController.updateUser
  );
  router.delete('/users/:id', authenticate, authorize('ADMIN', 'MANAGER'), adminUserController.deleteUser);

  return router;
};


