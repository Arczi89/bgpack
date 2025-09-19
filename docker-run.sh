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

echo "🐳 BGPack - Docker Setup"
echo "========================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_warning "docker-compose not found. Trying 'docker compose'..."
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Build and start services
print_status "Building and starting BGPack services..."
$COMPOSE_CMD up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    print_success "🎉 BGPack is running!"
    echo ""
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:8080"
    echo ""
    echo "To stop: docker-compose down"
    echo "To view logs: docker-compose logs -f"
else
    print_warning "Some services may not have started properly. Check logs with:"
    echo "$COMPOSE_CMD logs"
fi
