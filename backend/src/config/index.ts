import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envCandidates = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

interface Config {
  server: {
    port: number;
    env: string;
    corsOrigins: string[];
    frontendUrl: string;
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
  aws: {
    region: string;
    s3Bucket: string;
    cloudFrontDomain: string;
  };
  ai: {
    serviceUrl: string;
  };
}

const defaultCorsOrigins = ['http://localhost:3000'];

const parseCorsOrigins = (value?: string): string[] => {
  if (!value) {
    return defaultCorsOrigins;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultCorsOrigins;
};

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigins,
    frontendUrl: process.env.FRONTEND_URL || corsOrigins[0],
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '24h',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
  cookie: {
    accessTokenName: 'accessToken',
    refreshTokenName: 'refreshToken',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket:
      process.env.AWS_S3_BUCKET ||
      process.env.AWS_S3_BUCKET_NAME ||
      'verita-phone-store-assets',
    cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || 'd1ffmiafbbgufv.cloudfront.net',
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'https://demo.honeysocial.click/predict',
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
