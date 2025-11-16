import { Request, Response, NextFunction } from 'express';
import { ServiceFactory } from '../services';
import { SUCCESS_MESSAGES } from '../constants';
import { UserDto } from '../dtos/UserDto';
import config from '../config';

export class AuthController {
  private authService = ServiceFactory.getAuthService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      const user = await this.authService.register({ email, password, name });
      const safeUserData = UserDto.fromUser(user);

      res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        data: { user: safeUserData }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });
      const safeUserData = UserDto.fromUser(result.user);

      this.saveTokensToCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: { user: safeUserData }
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const oldRefreshToken = req.cookies?.[config.cookie.refreshTokenName];

      const newTokens = await this.authService.refreshAccessToken(oldRefreshToken);

      this.saveTokensToCookies(res, newTokens.accessToken, newTokens.refreshToken);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.userId);
      }

      this.clearTokensFromCookies(res);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  private saveTokensToCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = config.server.env === 'production';
    const oneHourInMs = 60 * 60 * 1000;

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
    };

    res.cookie(config.cookie.accessTokenName, accessToken, {
      ...cookieOptions,
      maxAge: oneHourInMs
    });

    res.cookie(config.cookie.refreshTokenName, refreshToken, {
      ...cookieOptions,
      maxAge: config.cookie.maxAge
    });
  }

  private clearTokensFromCookies(res: Response): void {
    res.clearCookie(config.cookie.accessTokenName);
    res.clearCookie(config.cookie.refreshTokenName);
  }
}
