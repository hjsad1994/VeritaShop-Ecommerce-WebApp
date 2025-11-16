import { UserController } from './../controllers/UserController';
import express, { Router } from 'express';
import { UserValidation } from "../dtos/UserValidation";
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware';

export const createUserRoutes = (): Router => {
    const router = express.Router();
    const userController = new UserController();
    
    // protected routes
    router.get('/me', authenticate, userController.getCurrentUser);
    router.put('/profile', authenticate, validate(UserValidation.update()), userController.updateProfile);
    return router;
}
