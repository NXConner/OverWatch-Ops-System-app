require('dotenv').config();
const { Pool } = require('pg');

const createExtendedTablesSQL = `
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication (already exists)
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

-- Companies/Organizations (already exists)
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

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT,
    location_coordinates POINT,
    surface_area DECIMAL(10,2),
    surface_type VARCHAR(50) DEFAULT 'asphalt',
    condition VARCHAR(50) DEFAULT 'good',
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    start_date DATE,
    completion_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Operations
CREATE TABLE IF NOT EXISTS project_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    operator_id UUID REFERENCES users(id),
    operation_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Fleet Vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    vehicle_number VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deployed', 'maintenance', 'retired')),
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Personnel Locations
CREATE TABLE IF NOT EXISTS personnel_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50) DEFAULT 'active',
    current_project_id UUID REFERENCES projects(id),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Vehicle Locations
CREATE TABLE IF NOT EXISTS vehicle_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES fleet_vehicles(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    assigned_operator UUID REFERENCES users(id),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    equipment_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment Locations
CREATE TABLE IF NOT EXISTS equipment_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    assigned_project_id UUID REFERENCES projects(id),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Geofences
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    center_lat DECIMAL(10,8) NOT NULL,
    center_lng DECIMAL(11,8) NOT NULL,
    radius DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Operations Costs
CREATE TABLE IF NOT EXISTS daily_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    operation_date DATE NOT NULL,
    material_cost DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    equipment_cost DECIMAL(10,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS daily_cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    cost_date DATE NOT NULL,
    wages DECIMAL(10,2) DEFAULT 0,
    materials DECIMAL(10,2) DEFAULT 0,
    fuel DECIMAL(10,2) DEFAULT 0,
    equipment DECIMAL(10,2) DEFAULT 0,
    overhead DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, cost_date)
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) GENERATED ALWAYS AS (current_stock * unit_cost) STORED,
    unit_of_measure VARCHAR(50),
    reorder_level DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    last_restocked DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Alerts
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    details JSONB,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pavement Scans
CREATE TABLE IF NOT EXISTS pavement_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    operator_id UUID REFERENCES users(id),
    scan_area DECIMAL(10,2) NOT NULL,
    scan_type VARCHAR(100) NOT NULL,
    gps_coordinates JSONB,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    defects_detected JSONB,
    ai_confidence DECIMAL(3,2),
    image_urls TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Estimates
CREATE TABLE IF NOT EXISTS estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    project_name VARCHAR(255) NOT NULL,
    project_address TEXT,
    surface_area DECIMAL(10,2) NOT NULL,
    surface_type VARCHAR(50) DEFAULT 'asphalt',
    condition VARCHAR(50) DEFAULT 'good',
    access_complexity VARCHAR(50) DEFAULT 'moderate',
    estimate_data JSONB NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    ai_confidence DECIMAL(3,2),
    ai_source VARCHAR(50),
    invoice_number VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_company;
ALTER TABLE users ADD CONSTRAINT fk_users_company
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_personnel_locations_user ON personnel_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle ON vehicle_locations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_equipment_locations_equipment ON equipment_locations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_daily_operations_project ON daily_operations(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_operations_date ON daily_operations(operation_date);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON daily_cost_tracking(cost_date);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_pavement_scans_project ON pavement_scans(project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_customer ON estimates(customer_email);
CREATE INDEX IF NOT EXISTS idx_estimates_invoice ON estimates(invoice_number);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects USING GIST(location_coordinates);
CREATE INDEX IF NOT EXISTS idx_personnel_locations_point ON personnel_locations USING GIST(POINT(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_point ON vehicle_locations USING GIST(POINT(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_equipment_locations_point ON equipment_locations USING GIST(POINT(longitude, latitude));
`;

const insertExtendedSampleDataSQL = `
-- Insert sample company (if not exists)
INSERT INTO companies (id, name, address, phone, email) VALUES
    ('550e8400-e29b-41d4-a716-446655440001',
     'Blacktop Solutions LLC',
     '337 Ayers Orchard Road, Stuart, VA 24171',
     '(276) 694-2847',
     'info@blacktopsolutions.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user (if not exists)
INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440002',
     'admin@blacktopsolutions.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3pk/VpM4w2',
     'System Administrator',
     'admin',
     '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, company_id, name, description, location_address, surface_area, surface_type, condition, status, estimated_cost) VALUES
    ('650e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440001',
     'Walmart Parking Lot - Section A',
     'Sealcoating main parking area',
     '123 Commerce Drive, Stuart, VA',
     8500.00,
     'asphalt',
     'good',
     'active',
     4250.00),
    ('650e8400-e29b-41d4-a716-446655440002',
     '550e8400-e29b-41d4-a716-446655440001',
     'ABC Manufacturing Driveway',
     'Complete driveway resurfacing and sealcoating',
     '456 Industrial Blvd, Stuart, VA',
     12000.00,
     'asphalt',
     'fair',
     'planned',
     7200.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample fleet vehicles
INSERT INTO fleet_vehicles (id, company_id, vehicle_number, type, make, model, year, license_plate, status) VALUES
    ('750e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440001',
     'TRUCK-001',
     'Sealcoating Truck',
     'Ford',
     'F-550',
     2020,
     'BLS-001',
     'deployed'),
    ('750e8400-e29b-41d4-a716-446655440002',
     '550e8400-e29b-41d4-a716-446655440001',
     'TRUCK-002',
     'Material Transport',
     'Chevrolet',
     'Silverado 3500',
     2019,
     'BLS-002',
     'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (id, company_id, equipment_name, type, serial_number, status) VALUES
    ('850e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440001',
     'Sealcoating Sprayer #1',
     'Spray Equipment',
     'SM2024-001',
     'active'),
    ('850e8400-e29b-41d4-a716-446655440002',
     '550e8400-e29b-41d4-a716-446655440001',
     'Crack Router #1',
     'Crack Filling',
     'CR2023-015',
     'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample personnel locations
INSERT INTO personnel_locations (user_id, latitude, longitude, status, current_project_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440002',
     36.5962,
     -80.2741,
     'active',
     '650e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Insert sample vehicle locations
INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, assigned_operator) VALUES
    ('750e8400-e29b-41d4-a716-446655440001',
     36.5965,
     -80.2745,
     '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT DO NOTHING;

-- Insert sample geofences
INSERT INTO geofences (id, company_id, name, type, center_lat, center_lng, radius) VALUES
    ('950e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440001',
     'Stuart Work Zone',
     'work_area',
     36.5962,
     -80.2741,
     5000.00),
    ('950e8400-e29b-41d4-a716-446655440002',
     '550e8400-e29b-41d4-a716-446655440001',
     'Equipment Storage',
     'storage',
     36.5950,
     -80.2730,
     500.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (company_id, item_name, category, current_stock, unit_cost, unit_of_measure, reorder_level, supplier) VALUES
    ('550e8400-e29b-41d4-a716-446655440001',
     'SealMaster PMM',
     'sealcoating_materials',
     120.00,
     3.79,
     'gallons',
     20.00,
     'SealMaster'),
    ('550e8400-e29b-41d4-a716-446655440001',
     'Sand 50lb',
     'sealcoating_materials',
     45.00,
     10.00,
     'bags',
     10.00,
     'Local Supplier'),
    ('550e8400-e29b-41d4-a716-446655440001',
     'CrackMaster',
     'sealcoating_materials',
     25.00,
     44.95,
     'gallons',
     5.00,
     'SealMaster')
ON CONFLICT DO NOTHING;

-- Insert sample cost tracking for current month
INSERT INTO daily_cost_tracking (company_id, cost_date, wages, materials, fuel, equipment, overhead) VALUES
    ('550e8400-e29b-41d4-a716-446655440001',
     CURRENT_DATE,
     640.00,
     245.50,
     85.20,
     120.00,
     163.61),
    ('550e8400-e29b-41d4-a716-446655440001',
     CURRENT_DATE - INTERVAL '1 day',
     720.00,
     310.75,
     92.40,
     120.00,
     186.79)
ON CONFLICT (company_id, cost_date) DO NOTHING;

-- Insert sample daily operations
INSERT INTO daily_operations (project_id, operation_date, material_cost, labor_cost, equipment_cost, fuel_cost) VALUES
    ('650e8400-e29b-41d4-a716-446655440001',
     CURRENT_DATE,
     245.50,
     480.00,
     120.00,
     85.20),
    ('650e8400-e29b-41d4-a716-446655440001',
     CURRENT_DATE - INTERVAL '1 day',
     310.75,
     560.00,
     120.00,
     92.40)
ON CONFLICT DO NOTHING;

-- Insert sample project operations
INSERT INTO project_operations (project_id, operator_id, operation_type, status) VALUES
    ('650e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440002',
     'Surface Preparation',
     'completed'),
    ('650e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440002',
     'Sealcoating Application',
     'in_progress')
ON CONFLICT DO NOTHING;

-- Insert sample pavement scans
INSERT INTO pavement_scans (id, project_id, operator_id, scan_area, scan_type, gps_coordinates, status, ai_confidence) VALUES
    ('a50e8400-e29b-41d4-a716-446655440001',
     '650e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440002',
     2500.00,
     '3D_Surface_Scan',
     '{"lat": 36.5962, "lng": -80.2741}',
     'completed',
     0.94),
    ('a50e8400-e29b-41d4-a716-446655440002',
     '650e8400-e29b-41d4-a716-446655440001',
     '550e8400-e29b-41d4-a716-446655440002',
     1800.00,
     'Defect_Detection',
     '{"lat": 36.5965, "lng": -80.2745}',
     'completed',
     0.89)
ON CONFLICT (id) DO NOTHING;
`;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'blacktop_blackout',
  user: process.env.DB_USER || 'blacktop',
  password: process.env.DB_PASSWORD || 'blackout123',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initializeExtendedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🗄️  Initializing extended database schema...');

    // Create all tables
    await client.query(createExtendedTablesSQL);
    console.log('✅ Extended database schema created successfully');

    // Insert sample data
    console.log('📝 Inserting comprehensive sample data...');
    await client.query(insertExtendedSampleDataSQL);
    console.log('✅ Comprehensive sample data inserted successfully');

    // Verify the setup
    const projectsResult = await client.query('SELECT COUNT(*) FROM projects');
    const vehiclesResult = await client.query('SELECT COUNT(*) FROM fleet_vehicles');
    const inventoryResult = await client.query('SELECT COUNT(*) FROM inventory');
    const scansResult = await client.query('SELECT COUNT(*) FROM pavement_scans');
    
    console.log('📊 Database verification:');
    console.log(`   Projects: ${projectsResult.rows[0].count}`);
    console.log(`   Vehicles: ${vehiclesResult.rows[0].count}`);
    console.log(`   Inventory Items: ${inventoryResult.rows[0].count}`);
    console.log(`   Pavement Scans: ${scansResult.rows[0].count}`);

    console.log('🎉 Extended database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Extended database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeExtendedDatabase()
  .then(() => {
    console.log('Extended database initialization script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Extended database initialization script failed:', error);
    process.exit(1);
  });