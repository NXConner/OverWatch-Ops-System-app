"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.refreshToken = exports.verifyToken = exports.generateToken = exports.requireCompanyAccess = exports.requirePermission = exports.requireRole = exports.authMiddleware = exports.AuthError = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
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
//# sourceMappingURL=auth.js.map