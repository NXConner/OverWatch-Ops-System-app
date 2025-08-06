import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;
  
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends Error implements ApiError {
  statusCode = 400;
  code = 'BAD_REQUEST';
  isOperational = true;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ForbiddenError extends Error implements ApiError {
  statusCode = 403;
  code = 'FORBIDDEN';
  isOperational = true;
  
  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error implements ApiError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  isOperational = true;
  
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InternalServerError extends Error implements ApiError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  isOperational = true;
  
  constructor(message: string = 'Internal server error', public details?: any) {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends Error implements ApiError {
  statusCode = 503;
  code = 'SERVICE_UNAVAILABLE';
  isOperational = true;
  
  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiError = error as ApiError;
  
  // Default error values
  let statusCode = apiError.statusCode || 500;
  let code = apiError.code || 'INTERNAL_SERVER_ERROR';
  let message = error.message || 'An unexpected error occurred';
  let details = apiError.details;
  
  // Handle specific error types
  if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = {
      issues: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'DATABASE_VALIDATION_ERROR';
    message = 'Database validation failed';
    details = (error as any).errors?.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
    details = (error as any).errors?.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'FOREIGN_KEY_CONSTRAINT';
    message = 'Invalid reference to related resource';
  }
  
  // Generate unique request ID if not present
  const requestId = (req as any).requestId || generateRequestId();
  
  // Create error response
  const errorResponse: ErrorResponse = {
    error: getErrorName(statusCode),
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    requestId
  };
  
  // Add details in development or for client errors (4xx)
  if (details && (isDevelopment || statusCode < 500)) {
    errorResponse.details = details;
  }
  
  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }
  
  // Log error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  const logMessage = `${req.method} ${req.originalUrl} - ${statusCode} ${message}`;
  
  const logMeta = {
    requestId,
    userId: (req as any).user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    statusCode,
    code,
    ...(details && { details }),
    ...(isDevelopment && error.stack && { stack: error.stack })
  };
  
  if (logLevel === 'error') {
    logger.error(logMessage, logMeta);
  } else {
    logger.warn(logMessage, logMeta);
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Handle async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Unhandled error handlers
export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    
    // Graceful shutdown
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Graceful shutdown
    process.exit(1);
  });
  
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    // Perform cleanup here
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    // Perform cleanup here
    process.exit(0);
  });
};

// Helper functions
function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 422: return 'Unprocessable Entity';
    case 429: return 'Too Many Requests';
    case 500: return 'Internal Server Error';
    case 502: return 'Bad Gateway';
    case 503: return 'Service Unavailable';
    case 504: return 'Gateway Timeout';
    default: return statusCode >= 500 ? 'Server Error' : 'Client Error';
  }
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  (req as any).requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', (req as any).requestId);
  next();
};