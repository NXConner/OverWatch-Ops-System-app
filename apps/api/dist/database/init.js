"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.testDatabaseConnection = testDatabaseConnection;
const pg_1 = require("pg");
const schema_1 = require("./schema");
const logger_1 = require("../utils/logger");
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'blacktop_blackout',
    user: process.env.DB_USER || 'blacktop',
    password: process.env.DB_PASSWORD || 'blackout123',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        logger_1.logger.info('🗄️  Initializing database schema...');
        // Create all tables
        await client.query(schema_1.createTablesSQL);
        logger_1.logger.info('✅ Database schema created successfully');
        // Insert sample data
        logger_1.logger.info('📝 Inserting sample data...');
        await client.query(schema_1.insertSampleDataSQL);
        logger_1.logger.info('✅ Sample data inserted successfully');
        // Verify the setup
        const result = await client.query('SELECT COUNT(*) FROM companies');
        logger_1.logger.info(`📊 Database verification: ${result.rows[0].count} companies found`);
        logger_1.logger.info('🎉 Database initialization completed successfully!');
    }
    catch (error) {
        logger_1.logger.error('❌ Database initialization failed:', error);
        throw error;
    }
    finally {
        client.release();
    }
}
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger_1.logger.info('✅ Database connection successful:', result.rows[0].now);
        return true;
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        return false;
    }
}
// Run initialization if this file is executed directly
if (require.main === module) {
    require('dotenv').config();
    initializeDatabase()
        .then(() => {
        logger_1.logger.info('Database initialization script completed');
        process.exit(0);
    })
        .catch((error) => {
        logger_1.logger.error('Database initialization script failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=init.js.map