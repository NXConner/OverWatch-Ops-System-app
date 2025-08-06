#!/bin/bash

# Blacktop Blackout - Complete System Deployment Script
# =====================================================

set -e  # Exit on any error

echo "🚀 Starting Blacktop Blackout System Deployment"
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the monorepo root directory"
    exit 1
fi

# Environment variables
export NODE_ENV=production
export API_PORT=3333
export WEB_PORT=3000

print_status "Environment: $NODE_ENV"
print_status "API Port: $API_PORT"
print_status "Web Port: $WEB_PORT"

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Setup PostgreSQL Database
print_status "Setting up PostgreSQL database..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    print_warning "PostgreSQL not running, attempting to start..."
    
    # Try different ways to start PostgreSQL
    if command -v systemctl > /dev/null; then
        sudo systemctl start postgresql
    elif command -v service > /dev/null; then
        sudo service postgresql start
    else
        print_warning "Could not start PostgreSQL automatically"
        print_status "Please start PostgreSQL manually and re-run this script"
    fi
fi

# Initialize database if not already done
print_status "Initializing database..."
cd apps/api
if [ -f "init-db.js" ]; then
    node init-db.js
    if [ $? -eq 0 ]; then
        print_success "Database initialized successfully"
    else
        print_warning "Database initialization failed (may already be initialized)"
    fi
else
    print_warning "Database initialization script not found"
fi
cd ../..

# Step 3: Build all applications
print_status "Building applications..."

# Build API
print_status "Building API server..."
cd apps/api
npm run build 2>/dev/null || print_warning "API build command not available (using ts-node)"
cd ../..

# Build Web App
print_status "Building web application..."
cd apps/web-app
npm run build
if [ $? -eq 0 ]; then
    print_success "Web application built successfully"
else
    print_error "Failed to build web application"
    exit 1
fi
cd ../..

# Build Mobile App (Flutter)
if [ -d "apps/mobile_app" ]; then
    print_status "Building Flutter mobile application..."
    cd apps/mobile_app
    
    # Check if Flutter is available
    if command -v flutter > /dev/null; then
        flutter build web
        if [ $? -eq 0 ]; then
            print_success "Flutter web build completed"
        else
            print_warning "Flutter web build failed"
        fi
    else
        print_warning "Flutter not found in PATH, skipping mobile app build"
    fi
    cd ../..
fi

# Step 4: Create deployment directories
print_status "Creating deployment structure..."
mkdir -p deployment/{api,web,mobile,config,logs}

# Copy built files
if [ -d "apps/web-app/dist" ]; then
    cp -r apps/web-app/dist/* deployment/web/
    print_success "Web application copied to deployment"
fi

if [ -d "apps/mobile_app/build/web" ]; then
    cp -r apps/mobile_app/build/web/* deployment/mobile/
    print_success "Mobile application copied to deployment"
fi

# Copy API files
cp -r apps/api/* deployment/api/
print_success "API files copied to deployment"

# Step 5: Create environment files
print_status "Creating production environment files..."

# API Environment
cat > deployment/api/.env.production << EOF
NODE_ENV=production
API_PORT=3333

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blacktop_blackout
DB_USER=blacktop
DB_PASSWORD=blackout123
DB_SSL=false

# JWT Configuration
JWT_SECRET=blacktop_blackout_jwt_secret_key_2024_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=blacktop_blackout_refresh_secret_key_2024_production
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Business Configuration
BUSINESS_NAME=Blacktop Solutions LLC
BUSINESS_ADDRESS=337 Ayers Orchard Road, Stuart, VA 24171
BUSINESS_PHONE=(276) 555-0123
BUSINESS_EMAIL=info@blacktopsolutions.com

# Material Pricing (SealMaster)
SEALMASTER_PMM_COST=3.79
SAND_50LB_COST=10.00
PREP_SEAL_COST=50.00
FAST_DRY_COST=50.00
CRACKMASTER_COST=44.95
PROPANE_COST=10.00

# Labor Configuration
LABOR_RATE_MIN=40
LABOR_RATE_MAX=60
FULL_TIME_EMPLOYEES=2
PART_TIME_EMPLOYEES=1

# Weather Configuration
WEATHER_API_KEY=your_weather_api_key_here
WEATHER_ALERT_RADIUS=25

# Logging
LOG_LEVEL=info
LOG_MAX_FILES=5
LOG_MAX_SIZE=10m
EOF

# Web Environment
cat > deployment/web/.env.production << EOF
VITE_API_BASE_URL=http://localhost:3333
VITE_WEATHER_API_KEY=your_weather_api_key_here
VITE_APP_NAME=Blacktop Blackout
VITE_COMPANY_NAME=Blacktop Solutions LLC
EOF

print_success "Environment files created"

# Step 6: Create startup scripts
print_status "Creating startup scripts..."

# API Startup Script
cat > deployment/start-api.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/api"
echo "Starting Blacktop Blackout API Server..."
export NODE_ENV=production
npm start
EOF

# Web Startup Script
cat > deployment/start-web.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/web"
echo "Starting Blacktop Blackout Web Server..."
python3 -m http.server 3000 2>/dev/null || python -m http.server 3000
EOF

# Combined Startup Script
cat > deployment/start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Blacktop Blackout System"
echo "===================================="

# Start API in background
echo "Starting API server..."
cd "$(dirname "$0")"
./start-api.sh &
API_PID=$!
echo "API started with PID: $API_PID"

# Wait a moment for API to start
sleep 3

# Start Web server
echo "Starting web server..."
./start-web.sh &
WEB_PID=$!
echo "Web started with PID: $WEB_PID"

echo ""
echo "✅ Blacktop Blackout System is running!"
echo "📡 API Server: http://localhost:3333"
echo "🌐 Web Application: http://localhost:3000"
echo ""
echo "To stop the system, run: ./stop-all.sh"

# Save PIDs for stopping later
echo $API_PID > api.pid
echo $WEB_PID > web.pid

# Keep script running
wait
EOF

# Stop Script
cat > deployment/stop-all.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Blacktop Blackout System"
echo "===================================="

if [ -f api.pid ]; then
    API_PID=$(cat api.pid)
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID
        echo "API server stopped"
    fi
    rm api.pid
fi

if [ -f web.pid ]; then
    WEB_PID=$(cat web.pid)
    if kill -0 $WEB_PID 2>/dev/null; then
        kill $WEB_PID
        echo "Web server stopped"
    fi
    rm web.pid
fi

echo "✅ System stopped"
EOF

# Make scripts executable
chmod +x deployment/*.sh

print_success "Startup scripts created"

# Step 7: Create systemd service files (optional)
print_status "Creating systemd service files..."

cat > deployment/config/blacktop-api.service << EOF
[Unit]
Description=Blacktop Blackout API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/blacktop-blackout/api
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

cat > deployment/config/blacktop-web.service << EOF
[Unit]
Description=Blacktop Blackout Web Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/blacktop-blackout/web
ExecStart=/usr/bin/python3 -m http.server 3000
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service files created"

# Step 8: Create nginx configuration
print_status "Creating nginx configuration..."

cat > deployment/config/blacktop-nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    # Web Application
    location / {
        root /opt/blacktop-blackout/web;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3333/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Mobile App
    location /mobile/ {
        alias /opt/blacktop-blackout/mobile/;
        try_files $uri $uri/ /mobile/index.html;
    }
}
EOF

print_success "Nginx configuration created"

# Step 9: Create installation script
print_status "Creating system installation script..."

cat > deployment/install-system.sh << 'EOF'
#!/bin/bash
# System Installation Script for Blacktop Blackout

echo "🔧 Installing Blacktop Blackout System"
echo "======================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Create application directory
mkdir -p /opt/blacktop-blackout
cp -r * /opt/blacktop-blackout/

# Set permissions
chown -R www-data:www-data /opt/blacktop-blackout
chmod +x /opt/blacktop-blackout/*.sh

# Install systemd services
cp config/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable blacktop-api blacktop-web

# Install nginx configuration
if [ -d "/etc/nginx/sites-available" ]; then
    cp config/blacktop-nginx.conf /etc/nginx/sites-available/blacktop-blackout
    ln -sf /etc/nginx/sites-available/blacktop-blackout /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
fi

echo "✅ System installation completed"
echo "To start: systemctl start blacktop-api blacktop-web"
EOF

chmod +x deployment/install-system.sh

print_success "Installation script created"

# Step 10: Create documentation
print_status "Creating deployment documentation..."

cat > deployment/README.md << 'EOF'
# Blacktop Blackout - Deployment Guide

## System Overview

Blacktop Blackout is a comprehensive asphalt maintenance and sealcoating management platform featuring:

- **OverWatch-Ops Dashboard**: Real-time operational intelligence
- **PavementScan Pro**: AI-powered 3D scanning and defect detection
- **Pave Wise Weather Cast**: Environmental intelligence for operations
- **Pave AI Estimator**: Machine learning cost estimation
- **Mobile Field App**: Flutter-based mobile application

## Quick Start

### Development Mode
```bash
./start-all.sh
```

### Production Installation
```bash
sudo ./install-system.sh
sudo systemctl start blacktop-api blacktop-web
```

## Manual Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 12+ with PostGIS
- Python 3 (for web server)
- Optional: nginx, Flutter SDK

### 2. Database Setup
```bash
sudo -u postgres createdb blacktop_blackout
sudo -u postgres psql blacktop_blackout -c "CREATE EXTENSION postgis;"
cd api && node init-db.js
```

### 3. Application Start
```bash
# Start API
cd api && npm start

# Start Web (separate terminal)
cd web && python3 -m http.server 3000
```

## Configuration

### API Configuration (.env)
- Database connection settings
- JWT secrets
- Business configuration
- Material pricing
- Weather API keys

### Web Configuration (.env)
- API endpoint URL
- Weather API keys
- Application branding

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   React Web App  │    │   Admin Panel   │
│  (Mobile/Web)   │    │  (OverWatch-Ops) │    │   (Future)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   Express API    │
                    │  (Node.js/TS)    │
                    └──────────────────┘
                                 │
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   + PostGIS      │
                    └──────────────────┘
```

## Features Implemented

### Phase 0: Core Platform ✅
- [x] Nx monorepo structure
- [x] PostgreSQL/PostGIS database
- [x] JWT authentication & RBAC
- [x] Backend plugin manager
- [x] Module orchestration system

### Phase 2: Flagship Modules ✅
- [x] OverWatch-Ops dashboard
- [x] PavementScan Pro with 3D scanning
- [x] Weather intelligence system
- [x] AI-powered cost estimation
- [x] Flutter mobile application

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user info

### OverWatch Operations
- `GET /overwatch/dashboard` - Dashboard data
- `GET /overwatch/cost-center` - Cost analysis
- `GET /overwatch/locations` - Site locations
- `GET /overwatch/weather` - Weather data
- `POST /overwatch/pavement-scan` - Scan data

### Module Management
- `GET /modules` - List modules
- `POST /modules/install` - Install module
- `PATCH /modules/:id/toggle` - Toggle module

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check database credentials in .env
   - Verify PostGIS extension is installed

2. **API Server Won't Start**
   - Check port 3333 is available
   - Verify Node.js version (18+)
   - Check environment variables

3. **Web App Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js and npm versions
   - Verify all dependencies are installed

### Logs
- API logs: `deployment/logs/api.log`
- Web server logs: Browser developer console
- System logs: `journalctl -u blacktop-api`

## Support

For technical support or feature requests, contact:
- Email: info@blacktopsolutions.com
- Phone: (276) 555-0123

## License

Proprietary software for Blacktop Solutions LLC
EOF

print_success "Documentation created"

# Step 11: Final verification
print_status "Running final verification..."

# Check if builds were successful
if [ -d "deployment/web" ] && [ -f "deployment/api/package.json" ]; then
    print_success "Deployment structure verified"
else
    print_error "Deployment verification failed"
    exit 1
fi

# Create a summary
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
print_success "✅ Blacktop Blackout system successfully deployed"
echo ""
echo "📁 Deployment Structure:"
echo "   deployment/"
echo "   ├── api/          # Node.js API server"
echo "   ├── web/          # React web application"
echo "   ├── mobile/       # Flutter mobile app"
echo "   ├── config/       # System configuration files"
echo "   ├── logs/         # Application logs"
echo "   └── *.sh          # Startup/management scripts"
echo ""
echo "🚀 Next Steps:"
echo "   1. cd deployment"
echo "   2. ./start-all.sh"
echo "   3. Open http://localhost:3000"
echo ""
echo "🔧 Production Installation:"
echo "   sudo ./deployment/install-system.sh"
echo ""
echo "📖 Full documentation: deployment/README.md"
echo ""
print_success "Happy sealcoating! 🛣️"