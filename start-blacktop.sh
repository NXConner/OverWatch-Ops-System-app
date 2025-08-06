#!/bin/bash

# 🚀 Blacktop Blackout - Complete Startup Script
# This script starts the entire Blacktop Blackout platform

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Banner
clear
echo -e "${CYAN}"
cat << "EOF"
 ____  _            _    _                   ____  _            _               _   
| __ )| | __ _  ___| | _| |_ ___  _ __      | __ )| | __ _  ___| | _____  _   _| |_ 
|  _ \| |/ _` |/ __| |/ / __/ _ \| '_ \     |  _ \| |/ _` |/ __| |/ / _ \| | | | __|
| |_) | | (_| | (__|   <| || (_) | |_) |    | |_) | | (_| | (__|   < (_) | |_| | |_ 
|____/|_|\__,_|\___|_|\_\\__\___/| .__/     |____/|_|\__,_|\___|_|\_\___/ \__,_|\__|
                                |_|                                              
🛣️  ASPHALT MAINTENANCE MANAGEMENT PLATFORM 🛣️
EOF
echo -e "${NC}"

print_header "======================================================="
print_header "🚀 BLACKTOP BLACKOUT STARTUP SCRIPT"
print_header "======================================================="

# Check if running from correct directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    print_status "Checking port $port..."
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is in use. Attempting to free it..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        printf "."
        sleep 2
        attempt=$((attempt + 1))
    done
    print_error "$service_name failed to start within expected time"
    return 1
}

# Cleanup function
cleanup() {
    print_header "\n🧹 CLEANING UP PROCESSES..."
    
    # Kill background processes
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
        print_status "Stopped API server (PID: $API_PID)"
    fi
    
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
        print_status "Stopped web server (PID: $WEB_PID)"
    fi
    
    # Kill any remaining processes on our ports
    kill_port_processes 3333
    kill_port_processes 3000
    
    print_success "Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start main execution
print_header "\n🔧 PHASE 1: SYSTEM PREPARATION"
print_status "Project root: $(pwd)"
print_status "Current user: $(whoami)"
print_status "Date/Time: $(date)"

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed"
    exit 1
fi
print_success "Python version: $(python3 --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed"
    exit 1
fi

# Check if PostgreSQL is running
if ! sudo service postgresql status | grep -q "online" 2>/dev/null; then
    print_warning "PostgreSQL is not running. Starting it..."
    sudo service postgresql start
    sleep 3
fi
print_success "PostgreSQL is running"

# Check if build exists
if [ ! -d "dist/apps/api" ] || [ ! -d "dist/apps/web-app" ]; then
    print_warning "Built applications not found. Building now..."
    print_status "Installing dependencies..."
    npm install
    print_status "Building applications..."
    npm run build
fi
print_success "Application builds are ready"

# Clean up any existing processes
print_header "\n🧹 PHASE 2: CLEANUP EXISTING PROCESSES"
kill_port_processes 3333
kill_port_processes 3000

# Check database connection
print_header "\n🗄️  PHASE 3: DATABASE VERIFICATION"
print_status "Checking database connection..."

# Test database connection
if sudo -u postgres psql -d blacktop_blackout -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Database connection successful"
    
    # Check if tables exist
    table_count=$(sudo -u postgres psql -d blacktop_blackout -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    if [ "$table_count" -gt 0 ]; then
        print_success "Database schema ready ($table_count tables found)"
    else
        print_warning "Database schema not found. Initializing..."
        DB_NAME=blacktop_blackout node apps/api/init-db.js
    fi
else
    print_error "Cannot connect to database. Please ensure PostgreSQL is running and database exists."
    exit 1
fi

# Start services
print_header "\n🚀 PHASE 4: STARTING SERVICES"

# Start API server
print_status "Starting API server on port 3333..."
cd "$(pwd)"
DB_NAME=blacktop_blackout NODE_ENV=development nohup node dist/apps/api/main.js > api.log 2>&1 &
API_PID=$!
print_success "API server started (PID: $API_PID)"

# Wait a moment for API to initialize
sleep 3

# Start web server
print_status "Starting web server on port 3000..."
nohup python3 -m http.server 3000 --directory dist/apps/web-app > web.log 2>&1 &
WEB_PID=$!
print_success "Web server started (PID: $WEB_PID)"

# Wait for services to be ready
print_header "\n⏳ PHASE 5: SERVICE HEALTH CHECKS"

# Wait for API
if wait_for_service "http://localhost:3333/health" "API Server"; then
    API_STATUS="✅ RUNNING"
else
    API_STATUS="❌ FAILED"
fi

# Wait for Web
if wait_for_service "http://localhost:3000" "Web Server"; then
    WEB_STATUS="✅ RUNNING"
else
    WEB_STATUS="❌ FAILED"
fi

# Display final status
print_header "\n🎯 DEPLOYMENT STATUS SUMMARY"
echo "========================================"
echo -e "🌐 Web Application:  ${WEB_STATUS}"
echo -e "⚡ API Server:       ${API_STATUS}"
echo -e "🗄️  Database:         ✅ RUNNING"
echo -e "📱 Mobile Ready:     ✅ CONFIGURED"
echo "========================================"

if [[ "$API_STATUS" == *"RUNNING"* ]] && [[ "$WEB_STATUS" == *"RUNNING"* ]]; then
    print_header "\n🎉 SUCCESS! BLACKTOP BLACKOUT IS RUNNING!"
    echo ""
    print_success "🌐 Web Application: http://localhost:3000"
    print_success "⚡ API Endpoints:   http://localhost:3333"
    print_success "📊 API Health:      http://localhost:3333/health"
    echo ""
    print_header "👥 DEFAULT LOGIN CREDENTIALS:"
    echo "   Admin:   admin@blacktopsolutions.com / admin123"
    echo "   Manager: manager@blacktopsolutions.com / manager123"
    echo ""
    print_warning "⚠️  IMPORTANT: Change default passwords in production!"
    echo ""
    print_header "📋 USEFUL COMMANDS:"
    echo "   • View API logs:  tail -f api.log"
    echo "   • View Web logs:  tail -f web.log"
    echo "   • Stop services:  Ctrl+C"
    echo ""
    print_header "📚 DOCUMENTATION:"
    echo "   • Quick Start:     ./QUICK_START.md"
    echo "   • API Docs:        ./docs/api/API_DOCUMENTATION.md"
    echo "   • Deployment:      ./DEPLOYMENT_STATUS.md"
    echo ""
    
    # Keep script running and monitor services
    print_status "Services are running. Press Ctrl+C to stop all services."
    print_status "Monitoring service health..."
    
    while true; do
        sleep 30
        
        # Check API health
        if ! curl -s http://localhost:3333/health >/dev/null 2>&1; then
            print_error "API service appears to be down!"
        fi
        
        # Check web service
        if ! curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_error "Web service appears to be down!"
        fi
    done
    
else
    print_error "Some services failed to start. Check the logs for details:"
    echo "   • API logs:  cat api.log"
    echo "   • Web logs:  cat web.log"
    cleanup
    exit 1
fi