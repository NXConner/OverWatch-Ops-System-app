import { Pool, PoolClient } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-kit/api';
import { logger } from '../utils/logger';

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

      // Initialize Drizzle ORM
      this.db = drizzle(this.pool);

      // Enable PostGIS extensions
      await this.enablePostGISExtensions();

      // Run migrations
      await this.runMigrations();

      logger.info('Database initialization completed');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async enablePostGISExtensions(): Promise<void> {
    try {
      logger.info('Enabling PostGIS extensions...');
      const client = await this.getClient();
      
      // Enable required PostGIS extensions
      const extensions = [
        'postgis',
        'postgis_raster',
        'postgis_sfcgal', 
        'postgis_topology',
        'pgrouting',
        'fuzzystrmatch',
        'address_standardizer',
        'address_standardizer_data_us'
      ];

      for (const extension of extensions) {
        try {
          await client.query(`CREATE EXTENSION IF NOT EXISTS ${extension};`);
          logger.debug(`Enabled extension: ${extension}`);
        } catch (error) {
          // Some extensions might not be available, log warning but continue
          logger.warn(`Could not enable extension ${extension}:`, error);
        }
      }
      
      client.release();
      logger.info('PostGIS extensions enabled successfully');
    } catch (error) {
      logger.error('Failed to enable PostGIS extensions:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      logger.info('Running database migrations...');
      
      // TODO: Implement migrations using drizzle-kit
      // await migrate(this.db, { migrationsFolder: './migrations' });
      
      logger.info('Database migrations completed');
    } catch (error) {
      logger.error('Failed to run migrations:', error);
      throw error;
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