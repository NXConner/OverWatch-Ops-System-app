"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = exports.setupGlobalErrorHandlers = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.ServiceUnavailableError = exports.InternalServerError = exports.UnauthorizedError = exports.ForbiddenError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.statusCode = 400;
        this.code = 'VALIDATION_ERROR';
        this.isOperational = true;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(resource = 'Resource') {
        super(`${resource} not found`);
        this.statusCode = 404;
        this.code = 'NOT_FOUND';
        this.isOperational = true;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.statusCode = 409;
        this.code = 'CONFLICT';
        this.isOperational = true;
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.statusCode = 400;
        this.code = 'BAD_REQUEST';
        this.isOperational = true;
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class ForbiddenError extends Error {
    constructor(message = 'Access forbidden') {
        super(message);
        this.statusCode = 403;
        this.code = 'FORBIDDEN';
        this.isOperational = true;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class UnauthorizedError extends Error {
    constructor(message = 'Authentication required') {
        super(message);
        this.statusCode = 401;
        this.code = 'UNAUTHORIZED';
        this.isOperational = true;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class InternalServerError extends Error {
    constructor(message = 'Internal server error', details) {
        super(message);
        this.details = details;
        this.statusCode = 500;
        this.code = 'INTERNAL_SERVER_ERROR';
        this.isOperational = true;
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
class ServiceUnavailableError extends Error {
    constructor(message = 'Service temporarily unavailable') {
        super(message);
        this.statusCode = 503;
        this.code = 'SERVICE_UNAVAILABLE';
        this.isOperational = true;
        this.name = 'ServiceUnavailableError';
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const errorHandler = (error, req, res, next) => {
    const apiError = error;
    // Default error values
    let statusCode = apiError.statusCode || 500;
    let code = apiError.code || 'INTERNAL_SERVER_ERROR';
    let message = error.message || 'An unexpected error occurred';
    let details = apiError.details;
    // Handle specific error types
    if (error instanceof zod_1.ZodError) {
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
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    }
    else if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        code = 'DATABASE_VALIDATION_ERROR';
        message = 'Database validation failed';
        details = error.errors?.map((err) => ({
            field: err.path,
            message: err.message
        }));
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'Resource already exists';
        details = error.errors?.map((err) => ({
            field: err.path,
            message: err.message
        }));
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        code = 'FOREIGN_KEY_CONSTRAINT';
        message = 'Invalid reference to related resource';
    }
    // Generate unique request ID if not present
    const requestId = req.requestId || generateRequestId();
    // Create error response
    const errorResponse = {
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
        userId: req.user?.id,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        statusCode,
        code,
        ...(details && { details }),
        ...(isDevelopment && error.stack && { stack: error.stack })
    };
    if (logLevel === 'error') {
        logger_1.logger.error(logMessage, logMeta);
    }
    else {
        logger_1.logger.warn(logMessage, logMeta);
    }
    // Send error response
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Handle async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
// Unhandled error handlers
const setupGlobalErrorHandlers = () => {
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught Exception:', error);
        // Graceful shutdown
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Graceful shutdown
        process.exit(1);
    });
    process.on('SIGTERM', () => {
        logger_1.logger.info('SIGTERM received, shutting down gracefully');
        // Perform cleanup here
        process.exit(0);
    });
    process.on('SIGINT', () => {
        logger_1.logger.info('SIGINT received, shutting down gracefully');
        // Perform cleanup here
        process.exit(0);
    });
};
exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
// Helper functions
function getErrorName(statusCode) {
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
function generateRequestId() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
// Request ID middleware
const requestIdMiddleware = (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || generateRequestId();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
//# sourceMappingURL=error-handler.js.map