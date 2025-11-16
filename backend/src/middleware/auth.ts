import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import { TokenPayload } from '../types';
import { logger } from '../utils/logger';
import config from '../config';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.[config.cookie.accessTokenName];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw ApiError.unauthorized(ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    // Verify token
    const authService = ServiceFactory.getAuthService();
    const payload = await authService.verifyAccessToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by user ${req.user.userId} with role ${req.user.role}`
      );
      return next(ApiError.forbidden(ERROR_MESSAGES.FORBIDDEN));
    }

    next();
  };
};
