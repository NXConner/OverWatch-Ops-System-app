"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTablesSQL = exports.insertSampleDataSQL = exports.createTablesSQL = void 0;
// Database Schema for Blacktop Blackout OverWatch-Ops System
exports.createTablesSQL = `
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

-- Employees Management
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    emergency_contact JSONB,
    performance_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles and Equipment
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- truck, trailer, equipment
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(50),
    license_plate VARCHAR(20),
    registration_expires DATE,
    insurance_expires DATE,
    current_mileage DECIMAL(10,2),
    fuel_capacity DECIMAL(10,2),
    gvwr DECIMAL(10,2), -- Gross Vehicle Weight Rating
    curb_weight DECIMAL(10,2),
    specifications JSONB DEFAULT '{}',
    maintenance_log JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment (tools, machines, etc.)
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- sealcoating_tank, crack_machine, blower, etc.
    make VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    capacity DECIMAL(10,2),
    weight DECIMAL(10,2),
    specifications JSONB DEFAULT '{}',
    maintenance_schedule JSONB DEFAULT '{}',
    usage_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Materials and Supplies
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- sealer, sand, crack_filler, etc.
    supplier VARCHAR(255),
    unit_type VARCHAR(50), -- gallon, bag, box, tank
    current_cost DECIMAL(10,2),
    last_cost_update TIMESTAMP,
    specifications JSONB DEFAULT '{}',
    mixing_ratios JSONB DEFAULT '{}',
    coverage_rates JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory tracking
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    current_stock DECIMAL(10,2) DEFAULT 0,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(255),
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GPS Tracking and Location Data
CREATE TABLE IF NOT EXISTS location_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    accuracy DECIMAL(10,2),
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    activity VARCHAR(50), -- driving, walking, stationary, work
    battery_level INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Geofences for job sites and boundaries
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'work_site', -- work_site, office, supplier, restricted
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,
    radius DECIMAL(10,2), -- for circular geofences
    active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Time Tracking and Attendance
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    clock_in_location GEOGRAPHY(POINT, 4326),
    clock_out_location GEOGRAPHY(POINT, 4326),
    total_hours DECIMAL(5,2),
    break_time DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    wage_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adjusted')),
    notes TEXT,
    auto_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS cost_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- labor, materials, fuel, equipment
    subcategory VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    description TEXT,
    date DATE NOT NULL,
    receipt_image TEXT, -- file path or URL
    receipt_data JSONB, -- OCR extracted data
    project_id UUID, -- for future project tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(5,2),
    feels_like DECIMAL(5,2),
    humidity INTEGER,
    wind_speed DECIMAL(5,2),
    wind_direction INTEGER,
    pressure DECIMAL(8,2),
    visibility DECIMAL(5,2),
    uv_index DECIMAL(3,1),
    conditions VARCHAR(100),
    precipitation DECIMAL(5,2),
    forecast_data JSONB,
    source VARCHAR(100), -- API source
    created_at TIMESTAMP DEFAULT NOW()
);

-- PavementScan Pro Data
CREATE TABLE IF NOT EXISTS pavement_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    scan_location GEOGRAPHY(POINT, 4326) NOT NULL,
    scan_area GEOGRAPHY(POLYGON, 4326),
    total_area DECIMAL(10,2), -- square feet
    perimeter_length DECIMAL(10,2), -- feet
    scan_date TIMESTAMP DEFAULT NOW(),
    device_info JSONB, -- camera, LiDAR, etc.
    model_file_path TEXT, -- 3D model file location
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Defect Detection Results
CREATE TABLE IF NOT EXISTS defects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID REFERENCES pavement_scans(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL, -- crack, pothole, alligator, water_pooling
    severity VARCHAR(50), -- low, medium, high, critical
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    area GEOGRAPHY(POLYGON, 4326),
    measurements JSONB, -- length, width, depth, area
    confidence_score DECIMAL(3,2), -- AI confidence 0-1
    visual_markers JSONB, -- color coding, highlighting data
    repair_priority INTEGER DEFAULT 3, -- 1-5 scale
    estimated_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports and Documents
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES pavement_scans(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL, -- pavement_analysis, cost_summary, daily_activity
    title VARCHAR(255) NOT NULL,
    file_path TEXT, -- PDF, PNG, DXF, GeoJSON
    file_type VARCHAR(20),
    file_size BIGINT,
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Plugin Registry
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    plugin_type VARCHAR(50) DEFAULT 'backend', -- backend, frontend, hybrid
    file_path TEXT,
    checksum VARCHAR(64),
    signature TEXT,
    permissions JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    installed_at TIMESTAMP DEFAULT NOW(),
    last_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Settings and Configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    setting_type VARCHAR(50) DEFAULT 'general', -- general, security, integration
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, setting_key)
);

-- Audit Log for Security and Compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_employee ON location_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_timestamp ON location_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_location_tracking_location ON location_tracking USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_geofences_boundary ON geofences USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_cost_entries_company ON cost_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_date ON cost_entries(date);
CREATE INDEX IF NOT EXISTS idx_pavement_scans_location ON pavement_scans USING GIST(scan_location);
CREATE INDEX IF NOT EXISTS idx_defects_scan ON defects(scan_id);
CREATE INDEX IF NOT EXISTS idx_defects_location ON defects USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_audit_log_company ON audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
`;
// Sample data for development
exports.insertSampleDataSQL = `
-- Insert sample company
INSERT INTO companies (id, name, address, phone, email) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 
     'Blacktop Solutions LLC', 
     '337 Ayers Orchard Road, Stuart, VA 24171', 
     '(276) 555-0123', 
     'info@blacktopsolutions.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin user
INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440002',
     'admin@blacktopsolutions.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3pk/VpM4w2', -- password: admin123
     'System Administrator',
     'admin',
     '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample materials from SealMaster
INSERT INTO materials (company_id, name, category, supplier, unit_type, current_cost) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'SealMaster PMM Asphalt Sealer Concentrate', 'sealer', 'SealMaster', 'gallon', 3.79),
    ('550e8400-e29b-41d4-a716-446655440001', 'Sand 50lb bag', 'aggregate', 'SealMaster', 'bag', 10.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'Prep Seal', 'primer', 'SealMaster', 'bucket', 50.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'Fast Dry', 'additive', 'SealMaster', 'bucket', 50.00),
    ('550e8400-e29b-41d4-a716-446655440001', 'CrackMaster Crackfiller Parking Lot LP', 'crack_filler', 'SealMaster', 'box', 44.95),
    ('550e8400-e29b-41d4-a716-446655440001', 'Propane Tank', 'fuel', 'Local Supplier', 'tank', 10.00)
ON CONFLICT DO NOTHING;

-- Insert sample vehicle (1978 Chevy C30)
INSERT INTO vehicles (company_id, name, type, make, model, year, gvwr, curb_weight, specifications) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     '1978 Chevy C30 Work Truck',
     'truck',
     'Chevrolet',
     'C30 Custom Deluxe',
     1978,
     14000.00, -- GVWR
     4300.00,  -- Curb weight
     '{"engine": "350", "transmission": "3-speed manual", "fuel_capacity": 20}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert SealMaster SK 550 tank
INSERT INTO equipment (company_id, name, type, make, model, capacity, weight, specifications) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     'SealMaster SK 550 Tank Sealing Machine',
     'sealcoating_tank',
     'SealMaster',
     'SK 550',
     550.00, -- gallon capacity
     1865.00, -- empty weight
     '{"unit_type": "skid", "material_weight_per_gallon": 10, "full_weight": 7365}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert office geofence
INSERT INTO geofences (company_id, name, type, boundary) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001',
     'Main Office',
     'office',
     ST_GeogFromText('POLYGON((-80.2741 36.5962, -80.2738 36.5962, -80.2738 36.5965, -80.2741 36.5965, -80.2741 36.5962))'))
ON CONFLICT DO NOTHING;
`;
exports.dropTablesSQL = `
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS plugins CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS defects CASCADE;
DROP TABLE IF EXISTS pavement_scans CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS cost_entries CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS geofences CASCADE;
DROP TABLE IF EXISTS location_tracking CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;
//# sourceMappingURL=schema.js.map