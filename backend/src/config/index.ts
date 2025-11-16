import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  server: {
    port: number;
    env: string;
    corsOrigin: string;
  };
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
  };
  cookie: {
    accessTokenName: string;
    refreshTokenName: string;
    maxAge: number;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },
  cookie: {
    accessTokenName: 'accessToken',
    refreshTokenName: 'refreshToken',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

function validateEnvironmentVariables(): void {
  const requiredVariables = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missingVariables = requiredVariables.filter((key) => !process.env[key]);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}\n` +
      `Please add them to your .env file`
    );
  }
}

validateEnvironmentVariables();

export default config;
