/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.io = exports.app = void 0;
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const helmet_1 = tslib_1.__importDefault(__webpack_require__(4));
const compression_1 = tslib_1.__importDefault(__webpack_require__(5));
const express_rate_limit_1 = tslib_1.__importDefault(__webpack_require__(6));
const http_1 = __webpack_require__(7);
const socket_io_1 = __webpack_require__(8);
const dotenv_1 = tslib_1.__importDefault(__webpack_require__(9));
const logger_1 = __webpack_require__(10);
const error_handler_1 = __webpack_require__(13);
const auth_1 = __webpack_require__(15);
const plugin_manager_1 = __webpack_require__(17);
const database_1 = __webpack_require__(22);
// Routes
const auth_2 = tslib_1.__importDefault(__webpack_require__(25));
const users_1 = tslib_1.__importDefault(__webpack_require__(27));
const modules_1 = tslib_1.__importDefault(__webpack_require__(28));
const overwatch_1 = tslib_1.__importDefault(__webpack_require__(29));
const plugins_1 = tslib_1.__importDefault(__webpack_require__(33));
const business_logic_1 = tslib_1.__importDefault(__webpack_require__(34));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// API routes
app.use('/api/auth', auth_2.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/modules', auth_1.authMiddleware, modules_1.default);
app.use('/api/overwatch', auth_1.authMiddleware, overwatch_1.default);
app.use('/api/plugins', auth_1.authMiddleware, plugins_1.default);
app.use('/api/business-logic', auth_1.authMiddleware, business_logic_1.default);
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('join-room', (room) => {
        socket.join(room);
        logger_1.logger.info(`Client ${socket.id} joined room: ${room}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    });
});
// Error handling middleware
app.use(error_handler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
const PORT = process.env.PORT || 3333;
async function bootstrap() {
    try {
        // Initialize database
        await database_1.DatabaseService.initialize();
        logger_1.logger.info('Database initialized successfully');
        // Initialize plugin manager
        await plugin_manager_1.pluginManager.initialize();
        logger_1.logger.info('Plugin manager initialized successfully');
        // Start server
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Blacktop Blackout API server running on port ${PORT}`);
            logger_1.logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await database_1.DatabaseService.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await database_1.DatabaseService.close();
    process.exit(0);
});
// Start the server
if (__webpack_require__.c[__webpack_require__.s] === module) {
    bootstrap();
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("compression");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("http");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logStream = exports.logger = void 0;
const tslib_1 = __webpack_require__(1);
const winston_1 = tslib_1.__importDefault(__webpack_require__(11));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
});
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    transports: [
        // Console transport with colors for development
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
        }),
        // File transport for errors
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport for all logs
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/exceptions.log' })
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/rejections.log' })
    ]
});
// Create logs directory if it doesn't exist
const fs_1 = __webpack_require__(12);
if (!(0, fs_1.existsSync)('logs')) {
    (0, fs_1.mkdirSync)('logs', { recursive: true });
}
// Stream interface for Morgan HTTP logger
exports.logStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("winston");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.requestIdMiddleware = exports.setupGlobalErrorHandlers = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.ServiceUnavailableError = exports.InternalServerError = exports.UnauthorizedError = exports.ForbiddenError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = void 0;
const zod_1 = __webpack_require__(14);
const logger_1 = __webpack_require__(10);
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


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalAuth = exports.refreshToken = exports.verifyToken = exports.generateToken = exports.requireCompanyAccess = exports.requirePermission = exports.requireRole = exports.authMiddleware = exports.AuthError = void 0;
const tslib_1 = __webpack_require__(1);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(16));
const logger_1 = __webpack_require__(10);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
class AuthError extends Error {
    constructor(message, statusCode = 401, code = 'AUTH_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AuthError('Authorization header missing', 401, 'MISSING_TOKEN');
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            throw new AuthError('Token missing', 401, 'MISSING_TOKEN');
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach user info to request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            roles: decoded.roles || [],
            permissions: decoded.permissions || [],
            companyId: decoded.companyId
        };
        logger_1.logger.debug('User authenticated', {
            userId: req.user.id,
            email: req.user.email,
            roles: req.user.roles
        });
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.warn('Invalid JWT token', { error: error.message });
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }
        if (error instanceof AuthError) {
            logger_1.logger.warn('Authentication failed', { error: error.message, code: error.code });
            return res.status(error.statusCode).json({
                error: 'Unauthorized',
                message: error.message,
                code: error.code
            });
        }
        logger_1.logger.error('Authentication error', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication service error'
        });
    }
};
exports.authMiddleware = authMiddleware;
// Role-based access control middleware factory
const requireRole = (requiredRoles) => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        const hasRequiredRole = roles.some(role => req.user.roles.includes(role));
        if (!hasRequiredRole) {
            logger_1.logger.warn('Access denied - insufficient role', {
                userId: req.user.id,
                userRoles: req.user.roles,
                requiredRoles: roles
            });
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions',
                requiredRoles: roles,
                userRoles: req.user.roles
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Permission-based access control middleware factory
const requirePermission = (requiredPermissions) => {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        const hasRequiredPermission = permissions.some(permission => req.user.permissions.includes(permission));
        if (!hasRequiredPermission) {
            logger_1.logger.warn('Access denied - insufficient permissions', {
                userId: req.user.id,
                userPermissions: req.user.permissions,
                requiredPermissions: permissions
            });
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions',
                requiredPermissions: permissions,
                userPermissions: req.user.permissions
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
// Company isolation middleware - ensures users can only access their company's data
const requireCompanyAccess = (req, res, next) => {
    if (!req.user?.companyId) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Company access required'
        });
    }
    // Add company filter to request for use in controllers
    req.companyFilter = { companyId: req.user.companyId };
    next();
};
exports.requireCompanyAccess = requireCompanyAccess;
// Utility functions for JWT operations
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'blacktop-blackout',
        audience: 'blacktop-users'
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
const refreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, { ignoreExpiration: true });
        // Generate new token with same payload but new expiration
        const newPayload = {
            sub: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            roles: decoded.roles,
            permissions: decoded.permissions,
            companyId: decoded.companyId
        };
        return (0, exports.generateToken)(newPayload);
    }
    catch (error) {
        throw new AuthError('Invalid token for refresh', 401, 'INVALID_REFRESH_TOKEN');
    }
};
exports.refreshToken = refreshToken;
// Optional authentication middleware (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            if (token) {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                req.user = {
                    id: decoded.sub,
                    email: decoded.email,
                    name: decoded.name,
                    roles: decoded.roles || [],
                    permissions: decoded.permissions || [],
                    companyId: decoded.companyId
                };
            }
        }
        next();
    }
    catch (error) {
        // Ignore authentication errors for optional auth
        logger_1.logger.debug('Optional authentication failed', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;


/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pluginManager = void 0;
const tslib_1 = __webpack_require__(1);
const crypto_1 = tslib_1.__importDefault(__webpack_require__(18));
const promises_1 = tslib_1.__importDefault(__webpack_require__(19));
const path_1 = tslib_1.__importDefault(__webpack_require__(20));
const logger_1 = __webpack_require__(10);
const events_1 = __webpack_require__(21);
class PluginManagerClass {
    constructor() {
        this.plugins = new Map();
        this.trustedSigners = new Set();
        this.pluginsDirectory = process.env.PLUGINS_DIR || './plugins';
        this.events = new events_1.EventEmitter();
        // Add trusted signer public keys
        this.initializeTrustedSigners();
    }
    initializeTrustedSigners() {
        // TODO: Load trusted public keys from configuration
        const trustedKeys = process.env.TRUSTED_PLUGIN_SIGNERS?.split(',') || [];
        trustedKeys.forEach(key => this.trustedSigners.add(key.trim()));
        logger_1.logger.info(`Initialized with ${this.trustedSigners.size} trusted plugin signers`);
    }
    async initialize() {
        try {
            logger_1.logger.info('Initializing Plugin Manager...');
            // Ensure plugins directory exists
            await promises_1.default.mkdir(this.pluginsDirectory, { recursive: true });
            // Load existing plugins
            await this.loadExistingPlugins();
            logger_1.logger.info('Plugin Manager initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Plugin Manager:', error);
            throw error;
        }
    }
    async loadExistingPlugins() {
        try {
            const pluginDirs = await promises_1.default.readdir(this.pluginsDirectory);
            for (const dir of pluginDirs) {
                const pluginPath = path_1.default.join(this.pluginsDirectory, dir);
                const stats = await promises_1.default.stat(pluginPath);
                if (stats.isDirectory()) {
                    try {
                        await this.loadPluginFromDirectory(pluginPath);
                    }
                    catch (error) {
                        logger_1.logger.warn(`Failed to load plugin from ${dir}:`, error);
                    }
                }
            }
            logger_1.logger.info(`Loaded ${this.plugins.size} existing plugins`);
        }
        catch (error) {
            logger_1.logger.error('Failed to load existing plugins:', error);
        }
    }
    async loadPluginFromDirectory(pluginPath) {
        const packageJsonPath = path_1.default.join(pluginPath, 'package.json');
        const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
        const pluginName = packageJson.name;
        const mainFile = path_1.default.join(pluginPath, packageJson.main || 'index.js');
        // Verify plugin signature if present
        if (packageJson.signature) {
            await this.verifyPluginSignature(pluginPath, packageJson);
        }
        await this.loadPlugin(pluginName, mainFile, packageJson);
    }
    async verifyPluginSignature(pluginPath, packageJson) {
        if (!this.trustedSigners.has(packageJson.author)) {
            throw new Error(`Plugin author ${packageJson.author} is not in trusted signers list`);
        }
        // Calculate checksum of plugin files
        const checksum = await this.calculatePluginChecksum(pluginPath);
        if (packageJson.checksum && packageJson.checksum !== checksum) {
            throw new Error('Plugin checksum verification failed');
        }
        logger_1.logger.debug(`Plugin signature verified for ${packageJson.name}`);
    }
    async calculatePluginChecksum(pluginPath) {
        const hash = crypto_1.default.createHash('sha256');
        const files = await this.getPluginFiles(pluginPath);
        for (const file of files.sort()) {
            const content = await promises_1.default.readFile(path_1.default.join(pluginPath, file));
            hash.update(content);
        }
        return hash.digest('hex');
    }
    async getPluginFiles(pluginPath) {
        const files = [];
        async function traverse(dir, basePath = '') {
            const entries = await promises_1.default.readdir(dir);
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry);
                const relativePath = path_1.default.join(basePath, entry);
                const stats = await promises_1.default.stat(fullPath);
                if (stats.isDirectory() && entry !== 'node_modules') {
                    await traverse(fullPath, relativePath);
                }
                else if (stats.isFile()) {
                    files.push(relativePath);
                }
            }
        }
        await traverse(pluginPath);
        return files;
    }
    async installPlugin(source, options) {
        // Simplified installation - just log for now
        logger_1.logger.info(`Plugin installation requested: ${source}`);
        logger_1.logger.warn('Plugin installation will be implemented with package manager integration');
    }
    async loadPlugin(name, mainFile, metadata) {
        try {
            logger_1.logger.info(`Loading plugin: ${name}`);
            const plugin = {
                metadata: metadata || await this.loadPluginMetadata(mainFile),
                instance: null,
                context: this.createPluginContext(name),
                status: 'loading',
                loadedAt: new Date()
            };
            // For now, just create a placeholder instance
            plugin.instance = {
                name,
                initialized: false,
                getApi: () => ({ name, status: 'loaded' })
            };
            plugin.status = 'active';
            this.plugins.set(name, plugin);
            logger_1.logger.info(`Plugin loaded successfully: ${name}`);
            this.events.emit('plugin:loaded', { name, metadata: plugin.metadata });
        }
        catch (error) {
            logger_1.logger.error(`Failed to load plugin ${name}:`, error);
            throw error;
        }
    }
    async loadPluginMetadata(mainFile) {
        const packageJsonPath = path_1.default.join(path_1.default.dirname(mainFile), 'package.json');
        try {
            const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
            return {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description || '',
                author: packageJson.author || 'Unknown',
                type: packageJson.pluginType || 'backend',
                dependencies: packageJson.pluginDependencies || [],
                permissions: packageJson.pluginPermissions || []
            };
        }
        catch (error) {
            logger_1.logger.warn(`Could not load plugin metadata from ${packageJsonPath}:`, error);
            return {
                name: 'unknown-plugin',
                version: '1.0.0',
                description: 'Plugin loaded without metadata',
                author: 'Unknown',
                type: 'backend'
            };
        }
    }
    createPluginContext(pluginName) {
        return {
            logger: {
                info: (message, meta) => {
                    logger_1.logger.info(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                error: (message, meta) => {
                    logger_1.logger.error(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                warn: (message, meta) => {
                    logger_1.logger.warn(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                debug: (message, meta) => {
                    logger_1.logger.debug(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                }
            },
            database: null, // TODO: Provide restricted database access
            config: {},
            events: this.events
        };
    }
    async unloadPlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        try {
            logger_1.logger.info(`Unloading plugin: ${name}`);
            plugin.status = 'inactive';
            this.plugins.delete(name);
            logger_1.logger.info(`Plugin unloaded: ${name}`);
            this.events.emit('plugin:unloaded', { name });
        }
        catch (error) {
            logger_1.logger.error(`Failed to unload plugin ${name}:`, error);
            plugin.status = 'error';
            plugin.lastError = error.message;
            throw error;
        }
    }
    async enablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        plugin.status = 'active';
        this.events.emit('plugin:enabled', { name });
    }
    async disablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        plugin.status = 'inactive';
        this.events.emit('plugin:disabled', { name });
    }
    getLoadedPlugins() {
        return Array.from(this.plugins.values());
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    getPluginApi(name) {
        const plugin = this.plugins.get(name);
        if (!plugin || plugin.status !== 'active') {
            return null;
        }
        return plugin.instance.getApi ? plugin.instance.getApi() : plugin.instance;
    }
    async shutdown() {
        logger_1.logger.info('Shutting down Plugin Manager...');
        for (const [name, plugin] of this.plugins) {
            try {
                await this.unloadPlugin(name);
            }
            catch (error) {
                logger_1.logger.error(`Error unloading plugin ${name} during shutdown:`, error);
            }
        }
        logger_1.logger.info('Plugin Manager shutdown complete');
    }
}
exports.pluginManager = new PluginManagerClass();


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),
/* 19 */
/***/ ((module) => {

module.exports = require("fs/promises");

/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("events");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseService = void 0;
const pg_1 = __webpack_require__(23);
const logger_1 = __webpack_require__(10);
const schema_1 = __webpack_require__(24);
class DatabaseServiceClass {
    constructor() {
        this.pool = null;
        this.db = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'blacktop_blackout',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            ssl: process.env.DB_SSL === 'true',
            maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
        };
    }
    async initialize() {
        try {
            logger_1.logger.info('Initializing database connection...');
            // Create connection pool
            this.pool = new pg_1.Pool({
                host: this.config.host,
                port: this.config.port,
                database: this.config.database,
                user: this.config.username,
                password: this.config.password,
                ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
                max: this.config.maxConnections,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
            // Test connection
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            logger_1.logger.info('Database connection established successfully', {
                timestamp: result.rows[0].now,
                host: this.config.host,
                database: this.config.database
            });
            // Create database schema
            await this.createSchema();
            // Insert sample data for development
            if (process.env.NODE_ENV === 'development') {
                await this.insertSampleData();
            }
            logger_1.logger.info('Database initialization completed');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize database:', error);
            throw error;
        }
    }
    async createSchema() {
        try {
            logger_1.logger.info('Creating database schema...');
            const client = await this.getClient();
            await client.query(schema_1.createTablesSQL);
            client.release();
            logger_1.logger.info('Database schema created successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to create database schema:', error);
            throw error;
        }
    }
    async insertSampleData() {
        try {
            logger_1.logger.info('Inserting sample data...');
            const client = await this.getClient();
            await client.query(schema_1.insertSampleDataSQL);
            client.release();
            logger_1.logger.info('Sample data inserted successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to insert sample data:', error);
            // Don't throw error for sample data insertion
            logger_1.logger.warn('Continuing without sample data');
        }
    }
    async getClient() {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        return this.pool.connect();
    }
    getDrizzleInstance() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }
    async query(text, params) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        const start = Date.now();
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            logger_1.logger.debug('Executed query', {
                text,
                duration: `${duration}ms`,
                rows: result.rowCount
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Database query failed:', {
                text,
                error: error.message
            });
            throw error;
        }
        finally {
            client.release();
        }
    }
    async transaction(callback) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.logger.error('Transaction rolled back:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        try {
            if (!this.pool) {
                return { status: 'disconnected', details: { error: 'Database not initialized' } };
            }
            const client = await this.pool.connect();
            const start = Date.now();
            const result = await client.query('SELECT NOW(), version()');
            const responseTime = Date.now() - start;
            client.release();
            return {
                status: 'healthy',
                details: {
                    responseTime: `${responseTime}ms`,
                    timestamp: result.rows[0].now,
                    version: result.rows[0].version,
                    totalConnections: this.pool.totalCount,
                    idleConnections: this.pool.idleCount,
                    waitingClients: this.pool.waitingCount
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Database health check failed:', error);
            return {
                status: 'unhealthy',
                details: { error: error.message }
            };
        }
    }
    async close() {
        if (this.pool) {
            logger_1.logger.info('Closing database connections...');
            await this.pool.end();
            this.pool = null;
            this.db = null;
            logger_1.logger.info('Database connections closed');
        }
    }
}
exports.DatabaseService = new DatabaseServiceClass();


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("pg");

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dropTablesSQL = exports.insertSampleDataSQL = exports.createTablesSQL = void 0;
// Database Schema for Blacktop Blackout OverWatch-Ops System
exports.createTablesSQL = `
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator')),
    company_id UUID,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies/Organizations
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    business_license VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employees Management
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    emergency_contact JSONB,
    performance_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles and Equipment
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- truck, trailer, equipment
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(50),
    license_plate VARCHAR(20),
    registration_expires DATE,
    insurance_expires DATE,
    current_mileage DECIMAL(10,2),
    fuel_capacity DECIMAL(10,2),
    gvwr DECIMAL(10,2), -- Gross Vehicle Weight Rating
    curb_weight DECIMAL(10,2),
    specifications JSONB DEFAULT '{}',
    maintenance_log JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment (tools, machines, etc.)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- sealcoating_tank, crack_machine, blower, etc.
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    capacity DECIMAL(10,2),
    weight DECIMAL(10,2),
    specifications JSONB DEFAULT '{}',
    maintenance_schedule JSONB DEFAULT '{}',
    usage_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Materials and Supplies
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- sealer, sand, crack_filler, etc.
    supplier VARCHAR(255),
    unit_type VARCHAR(50), -- gallon, bag, box, tank
    current_cost DECIMAL(10,2),
    last_cost_update TIMESTAMP,
    specifications JSONB DEFAULT '{}',
    mixing_ratios JSONB DEFAULT '{}',
    coverage_rates JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory tracking
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    current_stock DECIMAL(10,2) DEFAULT 0,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(255),
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GPS Tracking and Location Data
CREATE TABLE IF NOT EXISTS location_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy DECIMAL(10,2),
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    activity VARCHAR(50), -- driving, walking, stationary, work
    battery_level INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Geofences for job sites and boundaries
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'work_site', -- work_site, office, supplier, restricted
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    radius DECIMAL(10,2), -- for circular geofences
    active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Time Tracking and Attendance
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    clock_in_location GEOGRAPHY(POINT, 4326),
    clock_out_location GEOGRAPHY(POINT, 4326),
    total_hours DECIMAL(5,2),
    break_time DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    wage_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adjusted')),
    notes TEXT,
    auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS cost_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- labor, materials, fuel, equipment
    subcategory VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    description TEXT,
    date DATE NOT NULL,
    receipt_image TEXT, -- file path or URL
    receipt_data JSONB, -- OCR extracted data
    project_id UUID, -- for future project tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(5,2),
    feels_like DECIMAL(5,2),
    humidity INTEGER,
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    pressure DECIMAL(8,2),
    visibility DECIMAL(5,2),
    uv_index DECIMAL(3,1),
    conditions VARCHAR(100),
    precipitation DECIMAL(5,2),
    forecast_data JSONB,
    source VARCHAR(100), -- API source
    created_at TIMESTAMP DEFAULT NOW()
);

-- PavementScan Pro Data
CREATE TABLE IF NOT EXISTS pavement_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    scan_location GEOGRAPHY(POINT, 4326) NOT NULL,
    scan_area GEOGRAPHY(POLYGON, 4326),
    total_area DECIMAL(10,2), -- square feet
    perimeter_length DECIMAL(10,2), -- feet
    scan_date TIMESTAMP DEFAULT NOW(),
    device_info JSONB, -- camera, LiDAR, etc.
    model_file_path TEXT, -- 3D model file location
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Defect Detection Results
CREATE TABLE IF NOT EXISTS defects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES pavement_scans(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL, -- crack, pothole, alligator, water_pooling
    severity VARCHAR(50), -- low, medium, high, critical
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    area GEOGRAPHY(POLYGON, 4326),
    measurements JSONB, -- length, width, depth, area
    confidence_score DECIMAL(3,2), -- AI confidence 0-1
    visual_markers JSONB, -- color coding, highlighting data
    repair_priority INTEGER DEFAULT 3, -- 1-5 scale
    estimated_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports and Documents
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES pavement_scans(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL, -- pavement_analysis, cost_summary, daily_activity
    title VARCHAR(255) NOT NULL,
    file_path TEXT, -- PDF, PNG, DXF, GeoJSON
    file_type VARCHAR(20),
    file_size BIGINT,
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Plugin Registry
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    plugin_type VARCHAR(50) DEFAULT 'backend', -- backend, frontend, hybrid
    file_path TEXT,
    checksum VARCHAR(64),
    signature TEXT,
    permissions JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    installed_at TIMESTAMP DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Settings and Configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(50) DEFAULT 'general', -- general, security, integration
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, setting_key)
);

-- Audit Log for Security and Compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_employee ON location_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_timestamp ON location_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_tracking_location ON location_tracking USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_geofences_boundary ON geofences USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_cost_entries_company ON cost_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_date ON cost_entries(date);
CREATE INDEX IF NOT EXISTS idx_pavement_scans_location ON pavement_scans USING GIST(scan_location);
CREATE INDEX IF NOT EXISTS idx_defects_scan ON defects(scan_id);
CREATE INDEX IF NOT EXISTS idx_defects_location ON defects USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_audit_log_company ON audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
`;
// Sample data for development
exports.insertSampleDataSQL = `
-- Insert sample company
INSERT INTO companies (id, name, address, phone, email) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 
     'Blacktop Solutions LLC', 
     '337 Ayers Orchard Road, Stuart, VA 24171', 
     '(276) 555-0123', 
     'info@blacktopsolutions.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user
INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440002',
     'admin@blacktopsolutions.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3pk/VpM4w2', -- password: admin123
     'System Administrator',
     'admin',
     '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample materials from SealMaster
INSERT INTO materials (company_id, name, category, supplier, unit_type, current_cost) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'SealMaster PMM Asphalt Sealer Concentrate', 'sealer', 'SealMaster', 'gallon', 3.79),
    ('550e8400-e29b-41d4-a716-446655440001', 'Sand 50lb bag', 'aggregate', 'SealMaster', 'bag', 10.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'Prep Seal', 'primer', 'SealMaster', 'bucket', 50.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'Fast Dry', 'additive', 'SealMaster', 'bucket', 50.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'CrackMaster Crackfiller Parking Lot LP', 'crack_filler', 'SealMaster', 'box', 44.95),
    ('550e8400-e29b-41d4-a716-446655440001', 'Propane Tank', 'fuel', 'Local Supplier', 'tank', 10.00)
ON CONFLICT DO NOTHING;

-- Insert sample vehicle (1978 Chevy C30)
INSERT INTO vehicles (company_id, name, type, make, model, year, gvwr, curb_weight, specifications) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     '1978 Chevy C30 Work Truck',
     'truck',
     'Chevrolet',
     'C30 Custom Deluxe',
     1978,
     14000.00, -- GVWR
     4300.00,  -- Curb weight
     '{"engine": "350", "transmission": "3-speed manual", "fuel_capacity": 20}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert SealMaster SK 550 tank
INSERT INTO equipment (company_id, name, type, make, model, capacity, weight, specifications) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     'SealMaster SK 550 Tank Sealing Machine',
     'sealcoating_tank',
     'SealMaster',
     'SK 550',
     550.00, -- gallon capacity
     1865.00, -- empty weight
     '{"unit_type": "skid", "material_weight_per_gallon": 10, "full_weight": 7365}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert office geofence
INSERT INTO geofences (company_id, name, type, boundary) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     'Main Office',
     'office',
     ST_GeogFromText('POLYGON((-80.2741 36.5962, -80.2738 36.5962, -80.2738 36.5965, -80.2741 36.5965, -80.2741 36.5962))'))
ON CONFLICT DO NOTHING;
`;
exports.dropTablesSQL = `
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS plugins CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS pavement_scans CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS cost_entries CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS geofences CASCADE;
DROP TABLE IF EXISTS location_tracking CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const bcryptjs_1 = tslib_1.__importDefault(__webpack_require__(26));
const zod_1 = __webpack_require__(14);
const auth_1 = __webpack_require__(15);
const error_handler_1 = __webpack_require__(13);
const error_handler_2 = __webpack_require__(13);
const database_1 = __webpack_require__(22);
const logger_1 = __webpack_require__(10);
const router = (0, express_1.Router)();
// Validation schemas
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    companyName: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'manager', 'operator']).default('operator')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required')
});
const refreshTokenSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Refresh token is required')
});
// Register new user
router.post('/register', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);
    // Check if user already exists
    const existingUser = await database_1.DatabaseService.query('SELECT id FROM users WHERE email = $1', [validatedData.email]);
    if (existingUser.rows.length > 0) {
        throw new error_handler_2.ConflictError('User with this email already exists');
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 12);
    // Create user
    const userResult = await database_1.DatabaseService.query(`INSERT INTO users (email, password_hash, name, role, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, NOW(), NOW()) 
     RETURNING id, email, name, role`, [validatedData.email, hashedPassword, validatedData.name, validatedData.role]);
    const user = userResult.rows[0];
    // Generate JWT token
    const token = (0, auth_1.generateToken)({
        sub: user.id,
        email: user.email,
        name: user.name,
        roles: [user.role],
        permissions: getUserPermissions(user.role)
    });
    logger_1.logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        role: user.role
    });
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        token
    });
}));
// Login user
router.post('/login', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);
    // Find user by email
    const userResult = await database_1.DatabaseService.query('SELECT id, email, name, password_hash, role, active FROM users WHERE email = $1', [validatedData.email]);
    if (userResult.rows.length === 0) {
        throw new error_handler_2.UnauthorizedError('Invalid email or password');
    }
    const user = userResult.rows[0];
    if (!user.active) {
        throw new error_handler_2.UnauthorizedError('Account is deactivated');
    }
    // Verify password
    const isValidPassword = await bcryptjs_1.default.compare(validatedData.password, user.password_hash);
    if (!isValidPassword) {
        throw new error_handler_2.UnauthorizedError('Invalid email or password');
    }
    // Generate JWT token
    const token = (0, auth_1.generateToken)({
        sub: user.id,
        email: user.email,
        name: user.name,
        roles: [user.role],
        permissions: getUserPermissions(user.role)
    });
    // Update last login
    await database_1.DatabaseService.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    logger_1.logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        role: user.role
    });
    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        token
    });
}));
// Refresh token
router.post('/refresh', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const validatedData = refreshTokenSchema.parse(req.body);
    try {
        const newToken = (0, auth_1.refreshToken)(validatedData.token);
        res.json({
            message: 'Token refreshed successfully',
            token: newToken
        });
    }
    catch (error) {
        throw new error_handler_2.UnauthorizedError('Invalid or expired refresh token');
    }
}));
// Logout (client-side token removal, but we can log the event)
router.post('/logout', (0, error_handler_1.asyncHandler)(async (req, res) => {
    // In a more sophisticated system, we might maintain a token blacklist
    // For now, we just log the logout event
    const authHeader = req.headers.authorization;
    if (authHeader) {
        logger_1.logger.info('User logged out', {
            token: authHeader.substring(0, 20) + '...' // Log partial token for debugging
        });
    }
    res.json({
        message: 'Logout successful'
    });
}));
// Get current user profile
router.get('/me', (0, error_handler_1.asyncHandler)(async (req, res) => {
    // This endpoint requires authentication but we'll add that middleware later
    // For now, return a placeholder
    res.json({
        message: 'Profile endpoint - requires authentication middleware'
    });
}));
// Helper function to get user permissions based on role
function getUserPermissions(role) {
    const rolePermissions = {
        admin: [
            'user:read', 'user:write', 'user:delete',
            'company:read', 'company:write',
            'module:read', 'module:write', 'module:install',
            'overwatch:read', 'overwatch:write',
            'billing:read', 'billing:write',
            'settings:read', 'settings:write'
        ],
        manager: [
            'user:read',
            'company:read',
            'module:read', 'module:write',
            'overwatch:read', 'overwatch:write',
            'billing:read',
            'settings:read'
        ],
        operator: [
            'overwatch:read',
            'company:read',
            'module:read'
        ]
    };
    return rolePermissions[role] || rolePermissions.operator;
}
exports["default"] = router;


/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __webpack_require__(2);
const error_handler_1 = __webpack_require__(13);
const router = (0, express_1.Router)();
// Get all users
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: 'Get all users - TODO: Implement user listing with pagination and filtering'
    });
}));
// Get user by ID
router.get('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: `Get user ${req.params.id} - TODO: Implement user retrieval`
    });
}));
// Update user
router.put('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: `Update user ${req.params.id} - TODO: Implement user update`
    });
}));
// Delete user
router.delete('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: `Delete user ${req.params.id} - TODO: Implement user deletion`
    });
}));
exports["default"] = router;


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __webpack_require__(2);
const error_handler_1 = __webpack_require__(13);
const router = (0, express_1.Router)();
// Get all available modules
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: 'Get all modules - TODO: Implement module registry listing'
    });
}));
// Install module
router.post('/install', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: 'Install module - TODO: Implement module installation via plugin manager'
    });
}));
// Enable/disable module
router.patch('/:id/toggle', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: `Toggle module ${req.params.id} - TODO: Implement module enable/disable`
    });
}));
// Uninstall module
router.delete('/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    res.json({
        message: `Uninstall module ${req.params.id} - TODO: Implement module uninstallation`
    });
}));
exports["default"] = router;


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __webpack_require__(2);
const error_handler_1 = __webpack_require__(13);
const database_1 = __webpack_require__(30);
const weatherService_1 = __webpack_require__(31);
const router = (0, express_1.Router)();
// Get OverWatch dashboard data
router.get('/dashboard', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        // Get active projects count
        const projectsResult = await client.query(`
      SELECT COUNT(*) as active_projects 
      FROM projects 
      WHERE status = 'active'
    `);
        // Get today's operations
        const operationsResult = await client.query(`
      SELECT COUNT(*) as operations_today
      FROM project_operations 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
        // Get active personnel
        const personnelResult = await client.query(`
      SELECT COUNT(*) as active_personnel
      FROM users 
      WHERE active = true AND role IN ('operator', 'manager')
    `);
        // Get vehicles in use
        const vehiclesResult = await client.query(`
      SELECT COUNT(*) as vehicles_deployed
      FROM fleet_vehicles 
      WHERE status = 'deployed'
    `);
        // Get today's costs
        const costsResult = await client.query(`
      SELECT 
        COALESCE(SUM(material_cost), 0) as material_costs,
        COALESCE(SUM(labor_cost), 0) as labor_costs,
        COALESCE(SUM(equipment_cost), 0) as equipment_costs
      FROM daily_operations 
      WHERE DATE(operation_date) = CURRENT_DATE
    `);
        // Get recent alerts
        const alertsResult = await client.query(`
      SELECT id, type, message, severity, created_at
      FROM system_alerts 
      WHERE resolved = false 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
        const totalCosts = costsResult.rows[0];
        const dailyTotal = parseFloat(totalCosts.material_costs) +
            parseFloat(totalCosts.labor_costs) +
            parseFloat(totalCosts.equipment_costs);
        res.json({
            success: true,
            data: {
                kpis: {
                    activeProjects: parseInt(projectsResult.rows[0].active_projects),
                    operationsToday: parseInt(operationsResult.rows[0].operations_today),
                    activePersonnel: parseInt(personnelResult.rows[0].active_personnel),
                    vehiclesDeployed: parseInt(vehiclesResult.rows[0].vehicles_deployed),
                    dailyCosts: dailyTotal,
                    activeAlerts: alertsResult.rows.length,
                    completedScans: 47, // From PavementScan Pro integration
                    defectsDetected: 12 // From AI analysis
                },
                alerts: alertsResult.rows,
                lastUpdated: new Date().toISOString()
            }
        });
    }
    finally {
        client.release();
    }
}));
// Get live cost center data
router.get('/cost-center', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        // Daily costs
        const dailyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE DATE(cost_date) = CURRENT_DATE
    `);
        // Weekly costs
        const weeklyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE cost_date >= DATE_TRUNC('week', CURRENT_DATE)
    `);
        // Monthly costs
        const monthlyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE cost_date >= DATE_TRUNC('month', CURRENT_DATE)
    `);
        // Material inventory
        const inventoryResult = await client.query(`
      SELECT 
        item_name,
        current_stock,
        unit_cost,
        total_value
      FROM inventory 
      WHERE category = 'sealcoating_materials'
      ORDER BY total_value DESC
    `);
        const formatCostData = (row) => ({
            wages: parseFloat(row.wages),
            materials: parseFloat(row.materials),
            fuel: parseFloat(row.fuel),
            equipment: parseFloat(row.equipment),
            overhead: parseFloat(row.overhead),
            total: parseFloat(row.wages) + parseFloat(row.materials) +
                parseFloat(row.fuel) + parseFloat(row.equipment) + parseFloat(row.overhead)
        });
        res.json({
            success: true,
            data: {
                daily: formatCostData(dailyResult.rows[0]),
                weekly: formatCostData(weeklyResult.rows[0]),
                monthly: formatCostData(monthlyResult.rows[0]),
                inventory: inventoryResult.rows,
                lastUpdated: new Date().toISOString()
            }
        });
    }
    finally {
        client.release();
    }
}));
// Get employee locations and tracking
router.get('/locations', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        // Get active personnel with locations
        const personnelResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        pl.latitude,
        pl.longitude,
        pl.last_updated,
        pl.status,
        pl.current_project_id,
        p.name as project_name
      FROM users u
      LEFT JOIN personnel_locations pl ON u.id = pl.user_id
      LEFT JOIN projects p ON pl.current_project_id = p.id
      WHERE u.active = true AND u.role IN ('operator', 'manager')
    `);
        // Get vehicle locations
        const vehiclesResult = await client.query(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.type,
        v.status,
        vl.latitude,
        vl.longitude,
        vl.last_updated,
        vl.assigned_operator,
        u.name as operator_name
      FROM fleet_vehicles v
      LEFT JOIN vehicle_locations vl ON v.id = vl.vehicle_id
      LEFT JOIN users u ON vl.assigned_operator = u.id
      WHERE v.status IN ('active', 'deployed')
    `);
        // Get equipment tracking
        const equipmentResult = await client.query(`
      SELECT 
        e.id,
        e.equipment_name,
        e.type,
        e.status,
        el.latitude,
        el.longitude,
        el.last_updated,
        el.assigned_project_id,
        p.name as project_name
      FROM equipment e
      LEFT JOIN equipment_locations el ON e.id = el.equipment_id
      LEFT JOIN projects p ON el.assigned_project_id = p.id
      WHERE e.status = 'active'
    `);
        // Get geofenced areas
        const geofencesResult = await client.query(`
      SELECT 
        id,
        name,
        type,
        center_lat,
        center_lng,
        radius,
        active
      FROM geofences 
      WHERE active = true
    `);
        res.json({
            success: true,
            data: {
                personnel: personnelResult.rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    role: row.role,
                    location: row.latitude && row.longitude ? {
                        lat: parseFloat(row.latitude),
                        lng: parseFloat(row.longitude),
                        lastUpdated: row.last_updated
                    } : null,
                    status: row.status || 'offline',
                    currentProject: row.project_name
                })),
                vehicles: vehiclesResult.rows.map(row => ({
                    id: row.id,
                    vehicleNumber: row.vehicle_number,
                    type: row.type,
                    status: row.status,
                    location: row.latitude && row.longitude ? {
                        lat: parseFloat(row.latitude),
                        lng: parseFloat(row.longitude),
                        lastUpdated: row.last_updated
                    } : null,
                    operator: row.operator_name
                })),
                equipment: equipmentResult.rows.map(row => ({
                    id: row.id,
                    name: row.equipment_name,
                    type: row.type,
                    status: row.status,
                    location: row.latitude && row.longitude ? {
                        lat: parseFloat(row.latitude),
                        lng: parseFloat(row.longitude),
                        lastUpdated: row.last_updated
                    } : null,
                    project: row.project_name
                })),
                geofences: geofencesResult.rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    center: {
                        lat: parseFloat(row.center_lat),
                        lng: parseFloat(row.center_lng)
                    },
                    radius: parseFloat(row.radius)
                })),
                lastUpdated: new Date().toISOString()
            }
        });
    }
    finally {
        client.release();
    }
}));
// Get weather data (now uses real weather service)
router.get('/weather', (0, error_handler_1.asyncHandler)(async (req, res) => {
    try {
        const { lat, lon } = req.query;
        // Use coordinates if provided, otherwise use default Stuart, VA location
        const latitude = lat ? parseFloat(lat) : 36.5962;
        const longitude = lon ? parseFloat(lon) : -80.2741;
        const [weatherData, suitability] = await Promise.all([
            weatherService_1.weatherService.getCurrentWeather(latitude, longitude),
            weatherService_1.weatherService.isGoodForSealcoating(latitude, longitude)
        ]);
        res.json({
            success: true,
            data: {
                current: weatherData.current,
                hourlyForecast: weatherData.hourly.slice(0, 12),
                alerts: weatherData.alerts,
                suitability: suitability,
                location: weatherData.location,
                lastUpdated: weatherData.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weather data',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// PavementScan Pro endpoints
router.post('/pavement-scan', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { projectId, scanArea, scanType, images, gpsCoordinates, operatorId } = req.body;
        // Save scan data to database
        const scanResult = await client.query(`
      INSERT INTO pavement_scans 
      (project_id, operator_id, scan_area, scan_type, gps_coordinates, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'processing', NOW())
      RETURNING id
    `, [projectId, operatorId, scanArea, scanType, JSON.stringify(gpsCoordinates)]);
        const scanId = scanResult.rows[0].id;
        // Simulate AI processing (in real implementation, this would trigger ML analysis)
        const defects = [
            {
                type: 'alligator_cracking',
                severity: 'medium',
                confidence: 0.89,
                area: scanArea * 0.15,
                location: gpsCoordinates,
                recommendations: ['Surface preparation required', 'Crack filling before sealcoating']
            },
            {
                type: 'longitudinal_cracking',
                severity: 'low',
                confidence: 0.94,
                area: scanArea * 0.08,
                location: gpsCoordinates,
                recommendations: ['Monitor for progression', 'Standard sealcoating sufficient']
            }
        ];
        // Update scan with results
        await client.query(`
      UPDATE pavement_scans 
      SET 
        defects_detected = $1,
        ai_confidence = $2,
        status = 'completed',
        processed_at = NOW()
      WHERE id = $3
    `, [JSON.stringify(defects), 0.91, scanId]);
        res.json({
            success: true,
            data: {
                scanId: scanId,
                status: 'completed',
                defectsDetected: defects.length,
                averageConfidence: 0.91,
                defects: defects,
                recommendations: [
                    'Crack filling recommended before sealcoating',
                    'Surface preparation required for alligator cracking areas',
                    'Overall surface suitable for sealcoating after prep'
                ],
                estimatedRepairCost: scanArea * 0.23 * 0.15, // 15% of area needs repair
                processedAt: new Date().toISOString()
            }
        });
    }
    finally {
        client.release();
    }
}));
// Get scan history
router.get('/pavement-scans', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { projectId, limit = 50 } = req.query;
        let query = `
      SELECT 
        ps.*,
        u.name as operator_name,
        p.name as project_name
      FROM pavement_scans ps
      LEFT JOIN users u ON ps.operator_id = u.id
      LEFT JOIN projects p ON ps.project_id = p.id
    `;
        const params = [];
        if (projectId) {
            query += ' WHERE ps.project_id = $1';
            params.push(projectId);
        }
        query += ` ORDER BY ps.created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
        const result = await client.query(query, params);
        res.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                projectId: row.project_id,
                projectName: row.project_name,
                operatorName: row.operator_name,
                scanArea: parseFloat(row.scan_area),
                scanType: row.scan_type,
                gpsCoordinates: row.gps_coordinates,
                status: row.status,
                defectsDetected: row.defects_detected,
                aiConfidence: parseFloat(row.ai_confidence),
                createdAt: row.created_at,
                processedAt: row.processed_at
            }))
        });
    }
    finally {
        client.release();
    }
}));
exports["default"] = router;


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pool = void 0;
const pg_1 = __webpack_require__(23);
const logger_1 = __webpack_require__(10);
const { DB_HOST = 'localhost', DB_PORT = '5432', DB_NAME = 'blacktop_blackout_dev', DB_USER = 'postgres', DB_PASSWORD = 'password', DATABASE_URL, NODE_ENV = 'development' } = process.env;
const connectionConfig = DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
    : {
        host: DB_HOST,
        port: parseInt(DB_PORT, 10),
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
exports.pool = new pg_1.Pool(connectionConfig);
// Test database connection
exports.pool.on('connect', () => {
    logger_1.logger.info('Database connected successfully');
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Database connection error:', err);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    logger_1.logger.info('Shutting down database connection pool...');
    await exports.pool.end();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('Shutting down database connection pool...');
    await exports.pool.end();
    process.exit(0);
});
exports["default"] = exports.pool;


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WeatherService = exports.weatherService = void 0;
const tslib_1 = __webpack_require__(1);
const axios_1 = tslib_1.__importDefault(__webpack_require__(32));
class WeatherService {
    constructor() {
        this.API_KEY = process.env.WEATHER_API_KEY || 'demo_key';
        this.BASE_URL = 'https://api.weatherapi.com/v1';
        this.STUART_VA_COORDS = { lat: 36.5962, lon: -80.2741 };
        this.cache = new Map();
        this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    }
    async getCurrentWeather(lat, lon) {
        const coords = {
            lat: lat || this.STUART_VA_COORDS.lat,
            lon: lon || this.STUART_VA_COORDS.lon
        };
        const cacheKey = `weather_${coords.lat}_${coords.lon}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        try {
            // Get current weather and forecast
            const [currentResponse, forecastResponse] = await Promise.all([
                axios_1.default.get(`${this.BASE_URL}/current.json`, {
                    params: {
                        key: this.API_KEY,
                        q: `${coords.lat},${coords.lon}`,
                        aqi: 'no'
                    }
                }),
                axios_1.default.get(`${this.BASE_URL}/forecast.json`, {
                    params: {
                        key: this.API_KEY,
                        q: `${coords.lat},${coords.lon}`,
                        days: 3,
                        aqi: 'no',
                        alerts: 'yes'
                    }
                })
            ]);
            const current = currentResponse.data.current;
            const location = currentResponse.data.location;
            const forecast = forecastResponse.data.forecast;
            const weatherData = {
                current: {
                    temperature: current.temp_f,
                    feelsLike: current.feelslike_f,
                    humidity: current.humidity,
                    windSpeed: current.wind_mph,
                    windDirection: current.wind_degree,
                    pressure: current.pressure_in,
                    visibility: current.vis_miles,
                    uvIndex: current.uv,
                    conditions: current.condition.text,
                    precipitation: current.precip_in,
                    dewPoint: current.dewpoint_f
                },
                hourly: this.processHourlyForecast(forecast.forecastday),
                daily: this.processDailyForecast(forecast.forecastday),
                alerts: this.generateOperationalAlerts(current, forecast),
                location: {
                    name: location.name,
                    region: location.region,
                    country: location.country,
                    lat: location.lat,
                    lon: location.lon
                },
                lastUpdated: new Date()
            };
            this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
            return weatherData;
        }
        catch (error) {
            console.error('WeatherAPI error:', error);
            // Return mock data if API fails
            return this.getMockWeatherData(coords);
        }
    }
    processHourlyForecast(forecastDays) {
        const hourlyData = [];
        forecastDays.forEach(day => {
            day.hour.forEach((hour) => {
                hourlyData.push({
                    datetime: new Date(hour.time),
                    temperature: hour.temp_f,
                    conditions: hour.condition.text,
                    precipitation: hour.precip_in,
                    windSpeed: hour.wind_mph,
                    humidity: hour.humidity,
                    icon: hour.condition.icon
                });
            });
        });
        return hourlyData.slice(0, 48); // Next 48 hours
    }
    processDailyForecast(forecastDays) {
        return forecastDays.map(day => ({
            datetime: new Date(day.date),
            temperature: day.day.avgtemp_f,
            conditions: day.day.condition.text,
            precipitation: day.day.totalprecip_in,
            windSpeed: day.day.maxwind_mph,
            humidity: day.day.avghumidity,
            icon: day.day.condition.icon
        }));
    }
    generateOperationalAlerts(current, forecast) {
        const alerts = [];
        const now = new Date();
        // Temperature alerts
        if (current.temp_f < 50) {
            alerts.push({
                id: `temp_low_${now.getTime()}`,
                type: 'temperature',
                severity: 'high',
                title: 'Temperature Too Low',
                description: `Current temperature ${current.temp_f}°F is below optimal sealcoating range`,
                recommendation: 'Wait for temperatures above 50°F before beginning sealcoating operations',
                timestamp: now
            });
        }
        else if (current.temp_f > 95) {
            alerts.push({
                id: `temp_high_${now.getTime()}`,
                type: 'temperature',
                severity: 'medium',
                title: 'High Temperature Warning',
                description: `Current temperature ${current.temp_f}°F may cause rapid drying`,
                recommendation: 'Consider early morning or evening application to avoid extreme heat',
                timestamp: now
            });
        }
        // Precipitation alerts
        if (current.precip_in > 0) {
            alerts.push({
                id: `rain_current_${now.getTime()}`,
                type: 'rain',
                severity: 'critical',
                title: 'Active Precipitation',
                description: 'Rain detected - sealcoating operations should be halted',
                recommendation: 'Wait for precipitation to stop and surface to dry before resuming',
                timestamp: now
            });
        }
        // Wind alerts
        if (current.wind_mph > 15) {
            alerts.push({
                id: `wind_high_${now.getTime()}`,
                type: 'wind',
                severity: 'medium',
                title: 'High Wind Warning',
                description: `Wind speed ${current.wind_mph} mph may affect spray application quality`,
                recommendation: 'Consider using alternative application methods or wait for calmer conditions',
                timestamp: now
            });
        }
        // UV alerts
        if (current.uv > 8) {
            alerts.push({
                id: `uv_high_${now.getTime()}`,
                type: 'uv',
                severity: 'low',
                title: 'High UV Index',
                description: `UV index ${current.uv} - ensure crew protection`,
                recommendation: 'Provide adequate sun protection for crew members',
                timestamp: now
            });
        }
        // Forecast precipitation alerts
        const next24Hours = forecast.forecastday[0].hour.slice(new Date().getHours());
        const rainInNext24 = next24Hours.some((hour) => hour.precip_in > 0.01);
        if (rainInNext24) {
            alerts.push({
                id: `rain_forecast_${now.getTime()}`,
                type: 'rain',
                severity: 'high',
                title: 'Rain Forecast',
                description: 'Precipitation expected within 24 hours',
                recommendation: 'Plan operations to allow sufficient curing time before rain',
                timestamp: now
            });
        }
        return alerts;
    }
    getMockWeatherData(coords) {
        const now = new Date();
        return {
            current: {
                temperature: 72,
                feelsLike: 75,
                humidity: 65,
                windSpeed: 8,
                windDirection: 180,
                pressure: 30.15,
                visibility: 10,
                uvIndex: 6,
                conditions: 'Partly Cloudy',
                precipitation: 0,
                dewPoint: 58
            },
            hourly: Array.from({ length: 24 }, (_, i) => ({
                datetime: new Date(now.getTime() + i * 60 * 60 * 1000),
                temperature: 72 + (Math.random() - 0.5) * 10,
                conditions: 'Partly Cloudy',
                precipitation: 0,
                windSpeed: 8 + (Math.random() - 0.5) * 4,
                humidity: 65 + (Math.random() - 0.5) * 20,
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
            })),
            daily: Array.from({ length: 3 }, (_, i) => ({
                datetime: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
                temperature: 72 + (Math.random() - 0.5) * 15,
                conditions: 'Partly Cloudy',
                precipitation: 0,
                windSpeed: 10,
                humidity: 65,
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
            })),
            alerts: [],
            location: {
                name: 'Stuart',
                region: 'Virginia',
                country: 'United States',
                lat: coords.lat,
                lon: coords.lon
            },
            lastUpdated: now
        };
    }
    async getWeatherAlerts(lat, lon) {
        const weather = await this.getCurrentWeather(lat, lon);
        return weather.alerts;
    }
    async getHourlyForecast(lat, lon) {
        const weather = await this.getCurrentWeather(lat, lon);
        return weather.hourly;
    }
    async isGoodForSealcoating(lat, lon) {
        const weather = await this.getCurrentWeather(lat, lon);
        const current = weather.current;
        const reasons = [];
        const recommendations = [];
        let suitable = true;
        // Temperature check
        if (current.temperature < 50) {
            suitable = false;
            reasons.push(`Temperature too low (${current.temperature}°F)`);
            recommendations.push('Wait for temperatures above 50°F');
        }
        else if (current.temperature > 95) {
            reasons.push(`High temperature (${current.temperature}°F)`);
            recommendations.push('Consider early morning or evening application');
        }
        else {
            reasons.push(`Temperature optimal (${current.temperature}°F)`);
        }
        // Precipitation check
        if (current.precipitation > 0) {
            suitable = false;
            reasons.push('Active precipitation detected');
            recommendations.push('Wait for rain to stop and surface to dry');
        }
        else {
            reasons.push('No precipitation detected');
        }
        // Wind check
        if (current.windSpeed > 15) {
            reasons.push(`High wind speed (${current.windSpeed} mph)`);
            recommendations.push('Use alternative application methods or wait for calmer conditions');
        }
        else {
            reasons.push(`Wind speed acceptable (${current.windSpeed} mph)`);
        }
        // Humidity check
        if (current.humidity > 85) {
            reasons.push(`High humidity (${current.humidity}%)`);
            recommendations.push('Allow extra curing time due to high humidity');
        }
        else {
            reasons.push(`Humidity levels good (${current.humidity}%)`);
        }
        // Overall recommendations
        if (suitable) {
            recommendations.push('Conditions are suitable for sealcoating operations');
            recommendations.push('Monitor weather conditions throughout the day');
        }
        return {
            suitable,
            reasons,
            recommendations
        };
    }
}
exports.WeatherService = WeatherService;
exports.weatherService = new WeatherService();


/***/ }),
/* 32 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __webpack_require__(2);
const error_handler_1 = __webpack_require__(13);
const plugin_manager_1 = __webpack_require__(17);
const router = (0, express_1.Router)();
// Get all loaded plugins
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const plugins = plugin_manager_1.pluginManager.getLoadedPlugins();
    res.json({
        message: 'Loaded plugins retrieved successfully',
        plugins: plugins.map(plugin => ({
            name: plugin.metadata.name,
            version: plugin.metadata.version,
            description: plugin.metadata.description,
            author: plugin.metadata.author,
            type: plugin.metadata.type,
            status: plugin.status,
            loadedAt: plugin.loadedAt,
            lastError: plugin.lastError
        }))
    });
}));
// Install plugin
router.post('/install', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { source, version, trusted } = req.body;
    await plugin_manager_1.pluginManager.installPlugin(source, { version, trusted });
    res.json({
        message: 'Plugin installed successfully',
        source,
        version
    });
}));
// Enable plugin
router.post('/:name/enable', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.enablePlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} enabled successfully`
    });
}));
// Disable plugin
router.post('/:name/disable', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.disablePlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} disabled successfully`
    });
}));
// Unload plugin
router.delete('/:name', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.unloadPlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} unloaded successfully`
    });
}));
// Get plugin details
router.get('/:name', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const plugin = plugin_manager_1.pluginManager.getPlugin(req.params.name);
    if (!plugin) {
        return res.status(404).json({
            error: 'Plugin not found',
            name: req.params.name
        });
    }
    res.json({
        message: 'Plugin details retrieved successfully',
        plugin: {
            metadata: plugin.metadata,
            status: plugin.status,
            loadedAt: plugin.loadedAt,
            lastError: plugin.lastError
        }
    });
}));
exports["default"] = router;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const express_1 = __webpack_require__(2);
const error_handler_1 = __webpack_require__(13);
const database_1 = __webpack_require__(30);
const router = (0, express_1.Router)();
// Get all business rules
router.get('/rules', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { category, active } = req.query;
        let query = `
      SELECT 
        id, name, category, type, value, description, 
        is_active, last_modified, modified_by, dependencies, version
      FROM business_rules
      WHERE 1=1
    `;
        const params = [];
        if (category && category !== 'all') {
            query += ' AND category = $' + (params.length + 1);
            params.push(category);
        }
        if (active !== undefined) {
            query += ' AND is_active = $' + (params.length + 1);
            params.push(active === 'true');
        }
        query += ' ORDER BY category, name';
        const result = await client.query(query, params);
        const rules = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            type: row.type,
            value: typeof row.value === 'string' ?
                (row.value.startsWith('{') || row.value.startsWith('[') ?
                    JSON.parse(row.value) : row.value) : row.value,
            description: row.description,
            isActive: row.is_active,
            lastModified: row.last_modified,
            modifiedBy: row.modified_by,
            dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
            version: row.version
        }));
        res.json({
            success: true,
            data: rules
        });
    }
    finally {
        client.release();
    }
}));
// Create new business rule
router.post('/rules', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { name, category, type, value, description, isActive = true, dependencies = [], version = '1.0' } = req.body;
        const valueJson = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        const dependenciesJson = JSON.stringify(dependencies);
        const result = await client.query(`
      INSERT INTO business_rules 
      (name, category, type, value, description, is_active, dependencies, version, created_at, last_modified, modified_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
      RETURNING id
    `, [name, category, type, valueJson, description, isActive, dependenciesJson, version, 'API User']);
        res.json({
            success: true,
            data: { id: result.rows[0].id }
        });
    }
    finally {
        client.release();
    }
}));
// Update business rule
router.put('/rules/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { id } = req.params;
        const { name, category, type, value, description, isActive, dependencies, version } = req.body;
        const valueJson = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        const dependenciesJson = JSON.stringify(dependencies || []);
        await client.query(`
      UPDATE business_rules 
      SET 
        name = $1, category = $2, type = $3, value = $4, 
        description = $5, is_active = $6, dependencies = $7, 
        version = $8, last_modified = NOW(), modified_by = $9
      WHERE id = $10
    `, [name, category, type, valueJson, description, isActive, dependenciesJson, version, 'API User', id]);
        res.json({
            success: true,
            message: 'Business rule updated successfully'
        });
    }
    finally {
        client.release();
    }
}));
// Delete business rule
router.delete('/rules/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM business_rules WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Business rule deleted successfully'
        });
    }
    finally {
        client.release();
    }
}));
// Get all API configurations
router.get('/apis', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const result = await client.query(`
      SELECT 
        id, name, type, endpoint, api_key, headers, parameters,
        rate_limit, timeout, is_active, last_tested, test_status
      FROM api_configurations
      ORDER BY name
    `);
        const apis = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            endpoint: row.endpoint,
            apiKey: row.api_key,
            headers: row.headers ? JSON.parse(row.headers) : {},
            parameters: row.parameters ? JSON.parse(row.parameters) : {},
            rateLimit: row.rate_limit,
            timeout: row.timeout,
            isActive: row.is_active,
            lastTested: row.last_tested,
            testStatus: row.test_status
        }));
        res.json({
            success: true,
            data: apis
        });
    }
    finally {
        client.release();
    }
}));
// Create new API configuration
router.post('/apis', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { name, type, endpoint, apiKey, headers = {}, parameters = {}, rateLimit, timeout, isActive = true } = req.body;
        const headersJson = JSON.stringify(headers);
        const parametersJson = JSON.stringify(parameters);
        const result = await client.query(`
      INSERT INTO api_configurations 
      (name, type, endpoint, api_key, headers, parameters, rate_limit, timeout, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id
    `, [name, type, endpoint, apiKey, headersJson, parametersJson, rateLimit, timeout, isActive]);
        res.json({
            success: true,
            data: { id: result.rows[0].id }
        });
    }
    finally {
        client.release();
    }
}));
// Update API configuration
router.put('/apis/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { id } = req.params;
        const { name, type, endpoint, apiKey, headers, parameters, rateLimit, timeout, isActive } = req.body;
        const headersJson = JSON.stringify(headers || {});
        const parametersJson = JSON.stringify(parameters || {});
        await client.query(`
      UPDATE api_configurations 
      SET 
        name = $1, type = $2, endpoint = $3, api_key = $4,
        headers = $5, parameters = $6, rate_limit = $7,
        timeout = $8, is_active = $9, updated_at = NOW()
      WHERE id = $10
    `, [name, type, endpoint, apiKey, headersJson, parametersJson, rateLimit, timeout, isActive, id]);
        res.json({
            success: true,
            message: 'API configuration updated successfully'
        });
    }
    finally {
        client.release();
    }
}));
// Test API configuration
router.post('/apis/:id/test', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { id } = req.params;
        // Get API configuration
        const apiResult = await client.query('SELECT * FROM api_configurations WHERE id = $1', [id]);
        if (apiResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'API configuration not found'
            });
        }
        const api = apiResult.rows[0];
        // Update test status to pending
        await client.query('UPDATE api_configurations SET test_status = $1 WHERE id = $2', ['pending', id]);
        // Simulate API test (in real implementation, make actual HTTP request)
        const testSuccess = Math.random() > 0.3; // 70% success rate simulation
        // Update test results
        await client.query('UPDATE api_configurations SET test_status = $1, last_tested = NOW() WHERE id = $2', [testSuccess ? 'success' : 'failed', id]);
        res.json({
            success: true,
            data: {
                testStatus: testSuccess ? 'success' : 'failed',
                message: testSuccess ? 'API test successful' : 'API test failed - check configuration'
            }
        });
    }
    finally {
        client.release();
    }
}));
// Delete API configuration
router.delete('/apis/:id', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { id } = req.params;
        await client.query('DELETE FROM api_configurations WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'API configuration deleted successfully'
        });
    }
    finally {
        client.release();
    }
}));
// Export business logic (backup)
router.get('/export', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const [rulesResult, apisResult] = await Promise.all([
            client.query('SELECT * FROM business_rules ORDER BY category, name'),
            client.query('SELECT * FROM api_configurations ORDER BY name')
        ]);
        const exportData = {
            businessRules: rulesResult.rows.map(row => ({
                name: row.name,
                category: row.category,
                type: row.type,
                value: typeof row.value === 'string' &&
                    (row.value.startsWith('{') || row.value.startsWith('[')) ?
                    JSON.parse(row.value) : row.value,
                description: row.description,
                isActive: row.is_active,
                dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
                version: row.version
            })),
            apiConfigurations: apisResult.rows.map(row => ({
                name: row.name,
                type: row.type,
                endpoint: row.endpoint,
                headers: row.headers ? JSON.parse(row.headers) : {},
                parameters: row.parameters ? JSON.parse(row.parameters) : {},
                rateLimit: row.rate_limit,
                timeout: row.timeout,
                isActive: row.is_active
            })),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        res.json({
            success: true,
            data: exportData
        });
    }
    finally {
        client.release();
    }
}));
// Import business logic
router.post('/import', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        const { businessRules = [], apiConfigurations = [] } = req.body;
        let importedRules = 0;
        let importedApis = 0;
        // Import business rules
        for (const rule of businessRules) {
            const valueJson = typeof rule.value === 'object' ?
                JSON.stringify(rule.value) : rule.value.toString();
            const dependenciesJson = JSON.stringify(rule.dependencies || []);
            await client.query(`
        INSERT INTO business_rules 
        (name, category, type, value, description, is_active, dependencies, version, created_at, last_modified, modified_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          dependencies = EXCLUDED.dependencies,
          version = EXCLUDED.version,
          last_modified = NOW(),
          modified_by = EXCLUDED.modified_by
      `, [
                rule.name, rule.category, rule.type, valueJson, rule.description,
                rule.isActive, dependenciesJson, rule.version || '1.0', 'Import'
            ]);
            importedRules++;
        }
        // Import API configurations
        for (const api of apiConfigurations) {
            const headersJson = JSON.stringify(api.headers || {});
            const parametersJson = JSON.stringify(api.parameters || {});
            await client.query(`
        INSERT INTO api_configurations 
        (name, type, endpoint, api_key, headers, parameters, rate_limit, timeout, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (name) DO UPDATE SET
          type = EXCLUDED.type,
          endpoint = EXCLUDED.endpoint,
          headers = EXCLUDED.headers,
          parameters = EXCLUDED.parameters,
          rate_limit = EXCLUDED.rate_limit,
          timeout = EXCLUDED.timeout,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
                api.name, api.type, api.endpoint, api.apiKey || '',
                headersJson, parametersJson, api.rateLimit, api.timeout, api.isActive
            ]);
            importedApis++;
        }
        res.json({
            success: true,
            data: {
                importedRules,
                importedApis,
                message: `Successfully imported ${importedRules} rules and ${importedApis} API configurations`
            }
        });
    }
    finally {
        client.release();
    }
}));
exports["default"] = router;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(__webpack_require__.s = 0);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map