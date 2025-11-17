import { UserRepository, FindUsersParams } from './../repositories/UserRepository';
import { User, Role } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import { UpdateUserData } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';
export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
}

export interface CreateUserInput {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    phone?: string;
    address?: string;
    avatar?: string;
    isActive?: boolean;
}

export interface AdminUpdateUserInput {
    email?: string;
    password?: string;
    name?: string;
    role?: Role;
    phone?: string;
    address?: string;
    avatar?: string;
    isActive?: boolean;
}

export class UserService {
    private UserRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.UserRepository = userRepository;
    }
    async createUserByAdmin(data: CreateUserInput): Promise<User> {
        logger.info(`Admin creating user: ${data.email}`);

        const existingUser = await this.UserRepository.findByEmail(data.email);
        if (existingUser) {
            throw ApiError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.UserRepository.create({
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: data.role ?? Role.USER,
            phone: data.phone,
            address: data.address,
            avatar: data.avatar,
            isActive: data.isActive ?? true,
        });

        logger.info(`Admin created user successfully: ${user.id}`);
        return user;
    }
    async getUserById(userId: string): Promise<User> {
        const user = await this.UserRepository.findById(userId);
        if (!user) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }
    async updateUserByAdmin(userId: string, data: AdminUpdateUserInput): Promise<User> {
        const existingUser = await this.UserRepository.findById(userId);
        if (!existingUser) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (data.email && data.email !== existingUser.email) {
            const userWithSameEmail = await this.UserRepository.findByEmail(data.email);
            if (userWithSameEmail) {
                throw ApiError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
            }
        }

        const updateData: UpdateUserData = {
            email: data.email,
            name: data.name,
            role: data.role,
            phone: data.phone,
            address: data.address,
            avatar: data.avatar,
            isActive: data.isActive,
        };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof UpdateUserData] === undefined) {
                delete updateData[key as keyof UpdateUserData];
            }
        });

        const updatedUser = await this.UserRepository.update(userId, updateData);
        logger.info(`Admin updated user: ${updatedUser.id}`);
        return updatedUser;
    }
    async deleteUserByAdmin(userId: string): Promise<void> {
        const existingUser = await this.UserRepository.findById(userId);
        if (!existingUser) {
            throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        await this.UserRepository.delete(userId);
        logger.info(`Admin deleted user: ${userId}`);
    }
    async getUsers(params: { page?: number; limit?: number; search?: string; role?: Role; isActive?: boolean }): Promise<{ users: User[]; total: number; page: number; limit: number; }> {
        const page = params.page && params.page > 0 ? params.page : 1;
        const limit = params.limit && params.limit > 0 ? params.limit : 20;
        const skip = (page - 1) * limit;

        const findParams: FindUsersParams = {
            skip,
            take: limit,
            search: params.search,
            role: params.role,
            isActive: params.isActive,
        };

        const [users, total] = await Promise.all([
            this.UserRepository.findAll(findParams),
            this.UserRepository.count({ search: params.search, role: params.role, isActive: params.isActive })
        ]);

        return { users, total, page, limit };
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