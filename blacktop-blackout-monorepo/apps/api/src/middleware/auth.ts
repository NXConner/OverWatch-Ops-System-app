import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    companyId?: string;
  };
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  companyId?: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = 'AUTH_ERROR'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      companyId: decoded.companyId
    };
    
    logger.debug('User authenticated', {
      userId: req.user.id,
      email: req.user.email,
      roles: req.user.roles
    });
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof AuthError) {
      logger.warn('Authentication failed', { error: error.message, code: error.code });
      return res.status(error.statusCode).json({
        error: 'Unauthorized',
        message: error.message,
        code: error.code
      });
    }
    
    logger.error('Authentication error', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication service error'
    });
  }
};

// Role-based access control middleware factory
export const requireRole = (requiredRoles: string | string[]) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));
    
    if (!hasRequiredRole) {
      logger.warn('Access denied - insufficient role', {
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

// Permission-based access control middleware factory
export const requirePermission = (requiredPermissions: string | string[]) => {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const hasRequiredPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      logger.warn('Access denied - insufficient permissions', {
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

// Company isolation middleware - ensures users can only access their company's data
export const requireCompanyAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.companyId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Company access required'
    });
  }
  
  // Add company filter to request for use in controllers
  (req as any).companyFilter = { companyId: req.user.companyId };
  
  next();
};

// Utility functions for JWT operations
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'blacktop-blackout',
    audience: 'blacktop-users'
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const refreshToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as JWTPayload;
    
    // Generate new token with same payload but new expiration
    const newPayload = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: decoded.roles,
      permissions: decoded.permissions,
      companyId: decoded.companyId
    };
    
    return generateToken(newPayload);
  } catch (error) {
    throw new AuthError('Invalid token for refresh', 401, 'INVALID_REFRESH_TOKEN');
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7)
        : authHeader;
      
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional authentication failed', error);
    next();
  }
};