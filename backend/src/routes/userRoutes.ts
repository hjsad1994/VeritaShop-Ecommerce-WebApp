import { UserController } from './../controllers/UserController';
import express, { Router } from 'express';
import { UserValidation } from "../validations/UserValidation";
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware';

export const createUserRoutes = (): Router => {
    const router = express.Router();
    const userController = new UserController();
    
    // protected routes
    router.get('/me', authenticate, userController.getCurrentUser);
    router.put('/profile', authenticate, validate(UserValidation.update()), userController.updateProfile);
    
    // avatar upload routes
    router.post('/avatar/presigned-url', authenticate, userController.getAvatarPresignedUrl);
    router.delete('/avatar', authenticate, userController.deleteAvatar);
    
    return router;
}
