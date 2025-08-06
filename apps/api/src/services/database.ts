import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';
import { createTablesSQL, insertSampleDataSQL } from '../database/schema';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
}

class DatabaseServiceClass {
  private pool: Pool | null = null;
  private db: any = null;
  private config: DatabaseConfig;

  constructor() {
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

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing database connection...');
      
      // Create connection pool
      this.pool = new Pool({
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
      
      logger.info('Database connection established successfully', {
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

      logger.info('Database initialization completed');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    try {
      logger.info('Creating database schema...');
      const client = await this.getClient();
      
      await client.query(createTablesSQL);
      
      client.release();
      logger.info('Database schema created successfully');
    } catch (error) {
      logger.error('Failed to create database schema:', error);
      throw error;
    }
  }

  private async insertSampleData(): Promise<void> {
    try {
      logger.info('Inserting sample data...');
      const client = await this.getClient();
      
      await client.query(insertSampleDataSQL);
      
      client.release();
      logger.info('Sample data inserted successfully');
    } catch (error) {
      logger.error('Failed to insert sample data:', error);
      // Don't throw error for sample data insertion
      logger.warn('Continuing without sample data');
    }
  }

  async getClient(): Promise<PoolClient> {
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

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    
    const start = Date.now();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Executed query', {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
      
      return result;
    } catch (error) {
      logger.error('Database query failed:', {
        text,
        error: error.message
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
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
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      logger.info('Closing database connections...');
      await this.pool.end();
      this.pool = null;
      this.db = null;
      logger.info('Database connections closed');
    }
  }
}

export const DatabaseService = new DatabaseServiceClass();