import { Pool } from 'pg';
import { logger } from '../utils/logger';

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'blacktop_blackout_dev',
  DB_USER = 'postgres',
  DB_PASSWORD = 'password',
  DATABASE_URL,
  NODE_ENV = 'development'
} = process.env;

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

export const pool = new Pool(connectionConfig);

// Test database connection
pool.on('connect', () => {
  logger.info('Database connected successfully');
});

pool.on('error', (err) => {
  logger.error('Database connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down database connection pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down database connection pool...');
  await pool.end();
  process.exit(0);
});

export default pool;