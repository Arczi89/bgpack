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
    docker-compose -f docker-compose.dev.yml down
fi

# Stop frontend if PID file exists
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
        print_success "Frontend stopped"
    else
        print_warning "Frontend PID file is empty - frontend was already running"
        rm .frontend.pid
    fi
else
    print_warning "No frontend PID file found - frontend might still be running on port 3000"
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_warning "Frontend is still running on http://localhost:3000"
        print_status "You may need to stop it manually: Ctrl+C in the terminal where it's running"
    fi
fi

print_success "All services stopped"
