import { Pool } from 'pg';
import { createTablesSQL, insertSampleDataSQL } from './schema';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'blacktop_blackout',
  user: process.env.DB_USER || 'blacktop',
  password: process.env.DB_PASSWORD || 'blackout123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('🗄️  Initializing database schema...');
    
    // Create all tables
    await client.query(createTablesSQL);
    logger.info('✅ Database schema created successfully');
    
    // Insert sample data
    logger.info('📝 Inserting sample data...');
    await client.query(insertSampleDataSQL);
    logger.info('✅ Sample data inserted successfully');
    
    // Verify the setup
    const result = await client.query('SELECT COUNT(*) FROM companies');
    logger.info(`📊 Database verification: ${result.rows[0].count} companies found`);
    
    logger.info('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  
  initializeDatabase()
    .then(() => {
      logger.info('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization script failed:', error);
      process.exit(1);
    });
}