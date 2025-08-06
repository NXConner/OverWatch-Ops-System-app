"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const schema_1 = require("../database/schema");
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
//# sourceMappingURL=database.js.map