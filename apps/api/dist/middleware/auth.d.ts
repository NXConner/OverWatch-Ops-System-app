import { Request, Response, NextFunction } from 'express';
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
    sub: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    companyId?: string;
    iat: number;
    exp: number;
}
export declare class AuthError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (requiredRoles: string | string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requirePermission: (requiredPermissions: string | string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireCompanyAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (payload: Omit<JWTPayload, "iat" | "exp">) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const refreshToken: (token: string) => string;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map