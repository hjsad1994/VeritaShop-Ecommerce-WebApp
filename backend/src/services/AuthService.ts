import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { StringValue } from 'ms';
import { User } from '@prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { ERROR_MESSAGES } from '../constants';
import config from '../config';
import { TokenPayload, TokenPair } from '../types';
import { logger } from '../utils/logger';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(input: RegisterInput): Promise<User> {
    logger.info(`Registration attempt for email: ${input.email}`);

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      logger.warn(`Registration failed: User already exists - ${input.email}`);
      throw ApiError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    logger.info(`User registered successfully: ${user.id}`);
    return user;
  }

  async login(input: LoginInput): Promise<{ user: User; tokens: TokenPair }> {
    logger.info(`Login attempt for email: ${input.email}`);

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      logger.warn(`Login failed: User not found - ${input.email}`);
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      logger.warn(`Login failed: Invalid password - ${input.email}`);
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    logger.info(`User logged in successfully: ${user.id}`);
    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    logger.debug('Refresh token request received');

    if (!refreshToken) {
      throw ApiError.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED);
    }

    const user = await this.userRepository.findByRefreshToken(refreshToken);
    if (!user) {
      logger.warn('Refresh token not found in database');
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
    }

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    logger.info(`Tokens refreshed for user: ${user.id}`);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    logger.info(`Logout request for user: ${userId}`);
    await this.userRepository.updateRefreshToken(userId, null);
    logger.info(`User logged out successfully: ${userId}`);
  }

  private generateTokens(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry as StringValue | number }
    );

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.warn('Access token verification failed', error);
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }
}
