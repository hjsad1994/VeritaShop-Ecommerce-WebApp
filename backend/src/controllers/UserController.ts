import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { UserDto } from '../dtos/UserDto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import config from '../config';
import { ApiError } from '../utils/ApiError';
import { S3Service } from '../services/S3Service';

export class UserController {
    private userService = ServiceFactory.getUserService();
    private s3Service = new S3Service();

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

    getAvatarPresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
            }

            const { fileName, contentType } = req.body;

            if (!fileName || !contentType) {
                return next(ApiError.badRequest('fileName and contentType are required'));
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(contentType)) {
                return next(ApiError.badRequest('Invalid content type. Allowed: image/jpeg, image/png, image/webp'));
            }

            const userId = req.user.userId;
            const result = await this.s3Service.generateAvatarPresignedUrl(userId, fileName, contentType);

            res.status(200).json({
                success: true,
                message: 'Presigned URL generated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    deleteAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
            }

            const userId = req.user.userId;
            const user = await this.userService.getCurrentUser(userId);

            if (user.avatar) {
                const s3Key = this.s3Service.extractS3KeyFromCloudFrontUrl(user.avatar);
                if (s3Key) {
                    await this.s3Service.deleteFile(s3Key);
                }
            }

            await this.userService.updateUserProfile(userId, { avatar: null });

            res.status(200).json({
                success: true,
                message: 'Avatar deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}
