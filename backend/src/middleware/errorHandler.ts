import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponseHelper } from '../utils/response';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { logger } from '../utils/logger';
import config from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  logger.error('Error occurred:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return ApiResponseHelper.error(res, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return ApiResponseHelper.error(
      res,
      'Database error occurred',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponseHelper.error(
      res,
      ERROR_MESSAGES.INVALID_TOKEN,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponseHelper.error(
      res,
      'Token has expired',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return ApiResponseHelper.error(
      res,
      err.message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }

  // Default to 500 server error
  const message =
    config.server.env === 'development'
      ? err.message
      : ERROR_MESSAGES.INTERNAL_ERROR;

  return ApiResponseHelper.error(
    res,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return ApiResponseHelper.error(
    res,
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};
