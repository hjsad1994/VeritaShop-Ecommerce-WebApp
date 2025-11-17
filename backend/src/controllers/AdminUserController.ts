import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ServiceFactory } from '../services';
import { UserDto } from '../dtos/UserDto';
import { SUCCESS_MESSAGES } from '../constants';
import { ApiError } from '../utils/ApiError';

export class AdminUserController {
  private userService = ServiceFactory.getUserService();

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = '1', limit = '20', search, role, isActive } = req.query;

      const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
      const limitNumber = Math.max(Math.min(parseInt(limit as string, 10) || 20, 100), 1);

      const normalizedRole = role ? String(role).toUpperCase() : undefined;

      if (normalizedRole && !Object.values(Role).includes(normalizedRole as Role)) {
        return next(ApiError.badRequest('Vai trò không hợp lệ'));
      }

      const isActiveFilter =
        typeof isActive === 'string'
          ? isActive.toLowerCase() === 'true'
            ? true
            : isActive.toLowerCase() === 'false'
              ? false
              : undefined
          : undefined;

      const { users, total } = await this.userService.getUsers({
        page: pageNumber,
        limit: limitNumber,
        search: (search as string) || undefined,
        role: normalizedRole as Role | undefined,
        isActive: isActiveFilter,
      });

      const safeUsers = UserDto.fromUsers(users);
      const totalPages = Math.max(Math.ceil(total / limitNumber), 1);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_USERS_SUCCESS,
        data: {
          users: safeUsers,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, role, phone, address, avatar, isActive } = req.body;
      const normalizedRole = role ? (String(role).toUpperCase() as Role) : undefined;
      const normalizedStatus = typeof isActive === 'boolean' ? isActive : undefined;
      const newUser = await this.userService.createUserByAdmin({
        email,
        password,
        name,
        role: normalizedRole,
        phone,
        address,
        avatar,
        isActive: normalizedStatus,
      });

      const safeUser = UserDto.fromUser(newUser);

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATE_USER_SUCCESS,
        data: { user: safeUser },
      });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      const safeUser = UserDto.fromUser(user);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.GET_USER_SUCCESS,
        data: { user: safeUser },
      });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { email, password, name, role, phone, address, avatar, isActive } = req.body;
      const normalizedRole = role ? (String(role).toUpperCase() as Role) : undefined;
      const normalizedStatus = typeof isActive === 'boolean' ? isActive : undefined;

      const updatedUser = await this.userService.updateUserByAdmin(id, {
        email,
        password,
        name,
        role: normalizedRole,
        phone,
        address,
        avatar,
        isActive: normalizedStatus,
      });

      const safeUser = UserDto.fromUser(updatedUser);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_USER_SUCCESS,
        data: { user: safeUser },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.deleteUserByAdmin(id);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_USER_SUCCESS,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}


