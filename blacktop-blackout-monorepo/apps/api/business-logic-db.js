require('dotenv').config();
const { Pool } = require('pg');

const createBusinessLogicTablesSQL = `
-- Business Rules table
CREATE TABLE IF NOT EXISTS business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pricing', 'operations', 'calculations', 'validation', 'api', 'workflow')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('formula', 'constant', 'conditional', 'api_endpoint', 'configuration')),
    value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    dependencies JSONB DEFAULT '[]',
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW(),
    last_modified TIMESTAMP DEFAULT NOW(),
    modified_by VARCHAR(255) DEFAULT 'System'
);

-- API Configurations table
CREATE TABLE IF NOT EXISTS api_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('weather', 'ai', 'mapping', 'payment', 'notification', 'external')),
    endpoint TEXT NOT NULL,
    api_key TEXT,
    headers JSONB DEFAULT '{}',
    parameters JSONB DEFAULT '{}',
    rate_limit INTEGER,
    timeout INTEGER,
    is_active BOOLEAN DEFAULT true,
    last_tested TIMESTAMP,
    test_status VARCHAR(20) CHECK (test_status IN ('success', 'failed', 'pending')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_rules_category ON business_rules(category);
CREATE INDEX IF NOT EXISTS idx_business_rules_active ON business_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_business_rules_type ON business_rules(type);
CREATE INDEX IF NOT EXISTS idx_api_configurations_type ON api_configurations(type);
CREATE INDEX IF NOT EXISTS idx_api_configurations_active ON api_configurations(is_active);
`;

const insertBusinessLogicDataSQL = `
-- Insert default business rules
INSERT INTO business_rules (name, category, type, value, description, is_active, version) VALUES
    ('SealMaster PMM Unit Cost', 'pricing', 'constant', '3.79', 'Cost per gallon of SealMaster PMM concentrate', true, '1.0'),
    ('Sand 50lb Cost', 'pricing', 'constant', '10.00', 'Cost per 50lb bag of sand', true, '1.0'),
    ('CrackMaster Cost', 'pricing', 'constant', '44.95', 'Cost per gallon of CrackMaster crack filler', true, '1.0'),
    ('Overhead Percentage', 'pricing', 'constant', '0.15', 'Standard overhead markup (15%)', true, '1.0'),
    ('Profit Margin', 'pricing', 'constant', '0.20', 'Standard profit margin (20%)', true, '1.0'),
    ('Coverage Calculation', 'calculations', 'formula', 'area_sqft / 80', 'Calculates gallons needed based on area (80 sq ft coverage per gallon)', true, '1.2'),
    ('Sand Requirement Formula', 'calculations', 'formula', 'sealer_gallons / 6', 'Calculates sand bags needed (1 bag per 6 gallons of sealer)', true, '1.0'),
    ('Labor Rate Range', 'pricing', 'conditional', 'task_type === "prep" ? 45 : task_type === "crack_fill" ? 50 : task_type === "sealcoat" ? 55 : 40', 'Determines hourly labor rate based on task type', true, '1.1'),
    ('Weather Suitability Rules', 'operations', 'conditional', 'temperature >= 50 && temperature <= 95 && humidity < 85 && windSpeed < 15 && precipitation === 0', 'Determines if weather conditions are suitable for sealcoating', true, '2.0'),
    ('Project Size Multiplier', 'pricing', 'conditional', 'area_sqft > 10000 ? 0.95 : area_sqft > 5000 ? 0.98 : 1.0', 'Volume discount for larger projects', true, '1.0'),
    ('Equipment Utilization Rate', 'operations', 'constant', '0.85', 'Standard equipment utilization rate (85%)', true, '1.0'),
    ('Travel Time Factor', 'operations', 'formula', 'distance_miles * 0.5 + 30', 'Calculates setup time including travel (0.5 hrs per mile + 30 min base)', true, '1.0'),
    ('Quality Control Time', 'operations', 'formula', 'area_sqft / 1000 * 15', 'Quality control inspection time (15 min per 1000 sq ft)', true, '1.0'),
    ('Material Waste Factor', 'calculations', 'constant', '0.05', 'Material waste allowance (5%)', true, '1.0'),
    ('Minimum Job Charge', 'pricing', 'constant', '150.00', 'Minimum charge for any sealcoating job', true, '1.0')
ON CONFLICT (name) DO NOTHING;

-- Update dependencies for formulas
UPDATE business_rules SET dependencies = '["area_sqft"]' WHERE name = 'Coverage Calculation';
UPDATE business_rules SET dependencies = '["sealer_gallons"]' WHERE name = 'Sand Requirement Formula';
UPDATE business_rules SET dependencies = '["task_type"]' WHERE name = 'Labor Rate Range';
UPDATE business_rules SET dependencies = '["temperature", "humidity", "windSpeed", "precipitation"]' WHERE name = 'Weather Suitability Rules';
UPDATE business_rules SET dependencies = '["area_sqft"]' WHERE name = 'Project Size Multiplier';
UPDATE business_rules SET dependencies = '["distance_miles"]' WHERE name = 'Travel Time Factor';
UPDATE business_rules SET dependencies = '["area_sqft"]' WHERE name = 'Quality Control Time';

-- Insert default API configurations
INSERT INTO api_configurations (name, type, endpoint, api_key, headers, rate_limit, timeout, is_active, test_status) VALUES
    ('WeatherAPI', 'weather', 'https://api.weatherapi.com/v1', '', '{"Content-Type": "application/json"}', 1000000, 5000, true, 'success'),
    ('Google Gemini AI', 'ai', 'https://generativelanguage.googleapis.com/v1beta', '', '{"Content-Type": "application/json"}', 60, 30000, false, 'pending'),
    ('Google Maps API', 'mapping', 'https://maps.googleapis.com/maps/api', '', '{"Content-Type": "application/json"}', 25000, 10000, false, 'pending'),
    ('Stripe Payment Processing', 'payment', 'https://api.stripe.com/v1', '', '{"Content-Type": "application/x-www-form-urlencoded"}', 100, 15000, false, 'pending'),
    ('Twilio SMS Notifications', 'notification', 'https://api.twilio.com/2010-04-01', '', '{"Content-Type": "application/x-www-form-urlencoded"}', 1000, 10000, false, 'pending'),
    ('QuickBooks Integration', 'external', 'https://sandbox-quickbooks.api.intuit.com/v3', '', '{"Accept": "application/json"}', 500, 15000, false, 'pending')
ON CONFLICT (name) DO NOTHING;

-- Update API parameters
UPDATE api_configurations SET parameters = '{"model": "gemini-1.5-pro", "temperature": 0.3, "maxTokens": 4000}' WHERE name = 'Google Gemini AI';
UPDATE api_configurations SET parameters = '{"units": "imperial", "aqi": "no"}' WHERE name = 'WeatherAPI';
UPDATE api_configurations SET parameters = '{"region": "us"}' WHERE name = 'Google Maps API';
UPDATE api_configurations SET parameters = '{"currency": "usd", "payment_method_types": ["card"]}' WHERE name = 'Stripe Payment Processing';
`;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'blacktop_blackout',
  user: process.env.DB_USER || 'blacktop',
  password: process.env.DB_PASSWORD || 'blackout123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initializeBusinessLogicTables() {
  const client = await pool.connect();

  try {
    console.log('🧠 Initializing business logic tables...');

    // Create tables
    await client.query(createBusinessLogicTablesSQL);
    console.log('✅ Business logic tables created successfully');

    // Insert sample data
    console.log('📝 Inserting business logic data...');
    await client.query(insertBusinessLogicDataSQL);
    console.log('✅ Business logic data inserted successfully');

    // Verify the setup
    const rulesResult = await client.query('SELECT COUNT(*) FROM business_rules');
    const apisResult = await client.query('SELECT COUNT(*) FROM api_configurations');
    
    console.log('📊 Business Logic verification:');
    console.log(`   Business Rules: ${rulesResult.rows[0].count}`);
    console.log(`   API Configurations: ${apisResult.rows[0].count}`);

    console.log('🎉 Business logic initialization completed successfully!');

  } catch (error) {
    console.error('❌ Business logic initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeBusinessLogicTables()
  .then(() => {
    console.log('Business logic initialization script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Business logic initialization script failed:', error);
    process.exit(1);
  });