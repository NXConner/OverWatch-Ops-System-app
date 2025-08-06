require('dotenv').config();
const { Pool } = require('pg');

const createTablesSQL = `
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator')),
    company_id UUID,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies/Organizations
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    business_license VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_company;
ALTER TABLE users ADD CONSTRAINT fk_users_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
`;

const insertSampleDataSQL = `
-- Insert sample company
INSERT INTO companies (id, name, address, phone, email) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 
     'Blacktop Solutions LLC', 
     '337 Ayers Orchard Road, Stuart, VA 24171', 
     '(276) 694-2847', 
     'info@blacktopsolutions.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user
INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440002',
     'admin@blacktopsolutions.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3pk/VpM4w2',
     'System Administrator',
     'admin',
     '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;
`;

const pool = new Pool({
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
    console.log('🗄️  Initializing database schema...');
    
    // Create all tables
    await client.query(createTablesSQL);
    console.log('✅ Database schema created successfully');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    await client.query(insertSampleDataSQL);
    console.log('✅ Sample data inserted successfully');
    
    // Verify the setup
    const result = await client.query('SELECT COUNT(*) FROM companies');
    console.log(`📊 Database verification: ${result.rows[0].count} companies found`);
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log('Database initialization script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization script failed:', error);
    process.exit(1);
  });