import { Response } from 'express';
import { ApiResponse } from '../types';
import { HTTP_STATUS } from '../constants';

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode: number = HTTP_STATUS.OK
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: any[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
