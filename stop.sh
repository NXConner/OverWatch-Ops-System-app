#!/bin/bash

# 🛑 Blacktop Blackout Stop Script
# Cleanly stops all Blacktop Blackout services

echo "🛑 Stopping Blacktop Blackout Platform..."
echo "========================================"

# Function to kill processes on specific ports
kill_port_processes() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking for processes on port $port ($service_name)..."
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "🔄 Stopping $service_name on port $port..."
        lsof -ti:$port | xargs kill -TERM 2>/dev/null || true
        sleep 3
        
        # Force kill if still running
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "⚡ Force stopping $service_name..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
        
        echo "✅ $service_name stopped"
    else
        echo "ℹ️  No $service_name running on port $port"
    fi
}

# Function to kill processes by name
kill_named_processes() {
    local process_pattern=$1
    local service_name=$2
    
    echo "🔍 Checking for $service_name processes..."
    
    if pgrep -f "$process_pattern" >/dev/null 2>&1; then
        echo "🔄 Stopping $service_name processes..."
        pkill -TERM -f "$process_pattern" 2>/dev/null || true
        sleep 3
        
        # Force kill if still running
        if pgrep -f "$process_pattern" >/dev/null 2>&1; then
            echo "⚡ Force stopping $service_name processes..."
            pkill -9 -f "$process_pattern" 2>/dev/null || true
        fi
        
        echo "✅ $service_name processes stopped"
    else
        echo "ℹ️  No $service_name processes found"
    fi
}

# Stop services by port
kill_port_processes 3333 "API Server"
kill_port_processes 3000 "Web Server"

# Stop services by process name
kill_named_processes "node dist/apps/api/main.js" "Blacktop API"
kill_named_processes "python3.*http.server.*3000" "Blacktop Web Server"

# Clean up log files if they exist
echo "🧹 Cleaning up log files..."
rm -f api.log web.log 2>/dev/null || true

echo ""
echo "✅ Blacktop Blackout Platform stopped successfully!"
echo "🔄 To start again, run: ./start.sh"
echo ""