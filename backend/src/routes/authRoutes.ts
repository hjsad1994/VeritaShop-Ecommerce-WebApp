import express, { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthValidation } from '../dtos/AuthValidation';
import { validate } from '../middleware/validate';

// Factory function to create routes after initialization
export const createAuthRoutes = (): Router => {
  const router = express.Router();
  const authController = new AuthController();

  router.post(
    '/register',
    validate(AuthValidation.register()),
    authController.register
  );

  router.post(
    '/login',
    validate(AuthValidation.login()),
    authController.login
  );

  router.post('/refresh-token', authController.refreshToken);

  router.post('/logout', authController.logout);

  return router;
};
