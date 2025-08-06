#!/bin/bash

# 🚀 Simple Blacktop Blackout Launcher
# Quick and easy way to start the entire platform

echo "🚀 Starting Blacktop Blackout Platform..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "start-blacktop.sh" ]; then
    echo "❌ Error: start-blacktop.sh not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Execute the main startup script
exec ./start-blacktop.sh