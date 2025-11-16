import { PrismaClient } from '@prisma/client';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import { RepositoryFactory } from './repositories';
import { errorHandler, notFoundHandler, requestLogger } from './middleware';
import { logger } from './utils/logger';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createProductRoutes } from './routes/productRoutes';
// Initialize Express app
const app: Application = express();

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Repository Factory
RepositoryFactory.initialize(prisma);

// CORS configuration
const corsOptions = {
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging (only in development)
if (config.server.env === 'development') {
  app.use(requestLogger);
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (initialize after RepositoryFactory)
app.use('/api/auth', createAuthRoutes());
app.use('/api/users', createUserRoutes());
app.use('/api/products', createProductRoutes());
// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.server.port, () => {
      logger.info(`Server is running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`CORS Origin: ${config.server.corsOrigin}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start the server
startServer();

export default app;
