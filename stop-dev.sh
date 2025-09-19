#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

echo "🛑 Stopping BGPack Development Environment"
echo "=========================================="

# Stop backend (check if running locally or in Docker)
if [ -f .backend.pid ]; then
    print_status "Stopping local backend..."
    ./stop-backend-local.sh
else
    print_status "Stopping Docker backend..."
    docker-compose down
fi

# Stop frontend if PID file exists
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    print_status "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm .frontend.pid
    print_success "Frontend stopped"
else
    print_warning "No frontend PID file found"
fi

print_success "All services stopped"
