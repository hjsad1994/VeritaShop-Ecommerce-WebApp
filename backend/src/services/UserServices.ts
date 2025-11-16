import { UserRepository } from './../repositories/UserRepository';
// import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { RepositoryFactory } from '../repositories';
import { User } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import { UpdateUserData } from '../repositories/UserRepository';
export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

export class UserService {
    private UserRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.UserRepository = userRepository;
    }
    async getCurrentUser(userId: string): Promise<User> {
        logger.info(`Getting current user: ${userId}`);

        const user = await this.UserRepository.findById(userId);

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }
    async updateUserProfile(UserId: string, data: UpdateProfileInput): Promise<User> {
        const exitsingUser = await this.UserRepository.findById(UserId);
        if (!exitsingUser) {
            logger.warn(`User not found: ${UserId}`);
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        const updateData: UpdateUserData = {
            name: data.name,
            phone: data.phone,
            address: data.address,
            avatar: data.avatar,
        };
        // Xoá các filed undefined để không update
        Object.keys(updateData).forEach(key => {
            if(updateData[key as keyof UpdateUserData] === undefined) {
                delete updateData[key as keyof UpdateUserData];
            }
        });
        const updatedUser = await this.UserRepository.updateProfile(UserId, updateData);
        logger.info(`Profile updated successfully for user: ${updatedUser.id}`);
        return updatedUser;
    }

}