#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🛑 Stopping BGPack Local Backend"
echo "================================="

# Stop backend process
print_status "Stopping local backend..."
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill $BACKEND_PID 2>/dev/null; then
        print_success "Backend process $BACKEND_PID stopped"
    else
        print_warning "Backend process $BACKEND_PID was not running"
    fi
    rm .backend.pid
else
    print_warning "No backend PID file found"
fi

# Kill any remaining Spring Boot processes
print_status "Killing any remaining Spring Boot processes..."
pkill -f "spring-boot:run" || true

print_success "Local backend stopped"

