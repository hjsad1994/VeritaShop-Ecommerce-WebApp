import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { UserDto } from '../dtos/UserDto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import config from '../config';
import { ApiError } from '../utils/ApiError';
export class UserController {
    private userService = ServiceFactory.getUserService();

    getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(!req.user) {
                return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED))
            }
            const userId = req.user.userId;
            const user = await this.userService.getCurrentUser(userId);
            const safaUserData = UserDto.fromUser(user);
            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.GET_CURRENT_USER_SUCCESS,
                data: { user: safaUserData }
            })
        } catch (error) {
            next(error);
        }
    }
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(!req.user) {
                return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
            }
            const userId = req.user.userId
            const { name, phone, address, avatar } = req.body;
            const updateUser = await this.userService.updateUserProfile(userId,{
                name,
                phone,
                address,
                avatar
            });
            const safeUserData = UserDto.fromUser(updateUser);
            res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.UPDATE_USER_SUCCESS,
                data: { user: safeUserData }
            });

        } catch (error) {
            next(error);
        }
    }
}
