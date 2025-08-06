import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
    isOperational?: boolean;
}
export declare class ValidationError extends Error implements ApiError {
    details?: any | undefined;
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, details?: any | undefined);
}
export declare class NotFoundError extends Error implements ApiError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(resource?: string);
}
export declare class ConflictError extends Error implements ApiError {
    details?: any | undefined;
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, details?: any | undefined);
}
export declare class BadRequestError extends Error implements ApiError {
    details?: any | undefined;
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, details?: any | undefined);
}
export declare class ForbiddenError extends Error implements ApiError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message?: string);
}
export declare class UnauthorizedError extends Error implements ApiError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message?: string);
}
export declare class InternalServerError extends Error implements ApiError {
    details?: any | undefined;
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message?: string, details?: any | undefined);
}
export declare class ServiceUnavailableError extends Error implements ApiError {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message?: string);
}
export declare const errorHandler: (error: Error | ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const setupGlobalErrorHandlers: () => void;
export declare const requestIdMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error-handler.d.ts.map