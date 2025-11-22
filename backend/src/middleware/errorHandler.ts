import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import logger from '../utils/logger';
import config from '../config/env';

/**
 * Custom error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `Duplicate value for field: ${field}`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as MongooseError.ValidationError).errors).map(
      (e: any) => e.message
    );
    const message = `Validation error: ${errors.join(', ')}`;
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const message = `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB`;
      error = new AppError(message, 400);
    } else {
      const message = `File upload error: ${err.message}`;
      error = new AppError(message, 400);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
