import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { generateToken, refreshToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import { ValidationError, UnauthorizedError, ConflictError } from '../middleware/error-handler';
import { DatabaseService } from '../services/database';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional(),
  role: z.enum(['admin', 'manager', 'operator']).default('operator')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  token: z.string().min(1, 'Refresh token is required')
});

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await DatabaseService.query(
    'SELECT id FROM users WHERE email = $1',
    [validatedData.email]
  );
  
  if (existingUser.rows.length > 0) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);
  
  // Create user
  const userResult = await DatabaseService.query(
    `INSERT INTO users (email, password_hash, name, role, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, NOW(), NOW()) 
     RETURNING id, email, name, role`,
    [validatedData.email, hashedPassword, validatedData.name, validatedData.role]
  );
  
  const user = userResult.rows[0];
  
  // Generate JWT token
  const token = generateToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: [user.role],
    permissions: getUserPermissions(user.role)
  });
  
  logger.info('User registered successfully', {
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
router.post('/login', asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  
  // Find user by email
  const userResult = await DatabaseService.query(
    'SELECT id, email, name, password_hash, role, active FROM users WHERE email = $1',
    [validatedData.email]
  );
  
  if (userResult.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  const user = userResult.rows[0];
  
  if (!user.active) {
    throw new UnauthorizedError('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash);
  
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Generate JWT token
  const token = generateToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: [user.role],
    permissions: getUserPermissions(user.role)
  });
  
  // Update last login
  await DatabaseService.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );
  
  logger.info('User logged in successfully', {
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
router.post('/refresh', asyncHandler(async (req, res) => {
  const validatedData = refreshTokenSchema.parse(req.body);
  
  try {
    const newToken = refreshToken(validatedData.token);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}));

// Logout (client-side token removal, but we can log the event)
router.post('/logout', asyncHandler(async (req, res) => {
  // In a more sophisticated system, we might maintain a token blacklist
  // For now, we just log the logout event
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    logger.info('User logged out', {
      token: authHeader.substring(0, 20) + '...' // Log partial token for debugging
    });
  }
  
  res.json({
    message: 'Logout successful'
  });
}));

// Get current user profile
router.get('/me', asyncHandler(async (req, res) => {
  // This endpoint requires authentication but we'll add that middleware later
  // For now, return a placeholder
  res.json({
    message: 'Profile endpoint - requires authentication middleware'
  });
}));

// Helper function to get user permissions based on role
function getUserPermissions(role: string): string[] {
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

export default router;