import app from './app';
import config from './config/env';
import connectDB from './config/database';
import logger from './utils/logger';
import fs from 'fs/promises';

// Ensure directories exist
const ensureDirectories = async (): Promise<void> => {
  try {
    await fs.mkdir(config.storagePath, { recursive: true });
    await fs.mkdir(config.pdfPath, { recursive: true });
    await fs.mkdir('logs', { recursive: true });
    logger.info('Storage directories created');
  } catch (error) {
    logger.error('Error creating directories:', error);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Ensure directories exist
    await ensureDirectories();

    // Connect to database
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await (await import('mongoose')).connection.close();
          logger.info('MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
