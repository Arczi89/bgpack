#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo "🛑 Stopping BGPack..."

# Stop backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null || true
    rm .backend.pid
    print_success "Backend stopped"
fi

# Stop frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null || true
    rm .frontend.pid
    print_success "Frontend stopped"
fi

# Kill any remaining processes
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

print_success "All services stopped"
