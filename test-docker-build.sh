#!/bin/bash

# Docker Build Test Script
echo "🐳 Testing Docker build for SAP Todo List..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is installed and running
echo "Checking Docker installation..."
docker --version > /dev/null 2>&1
print_status $? "Docker is installed"

docker info > /dev/null 2>&1
print_status $? "Docker daemon is running"

# Check if Docker Compose is available
echo "Checking Docker Compose..."
docker compose version > /dev/null 2>&1
print_status $? "Docker Compose is available"

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker compose down -v > /dev/null 2>&1
print_warning "Cleaned up existing containers and volumes"

# Build backend
echo "Building backend image..."
docker compose build backend
print_status $? "Backend image built successfully"

# Build frontend
echo "Building frontend image..."
docker compose build frontend
print_status $? "Frontend image built successfully"

# Test complete build
echo "Building all services..."
docker compose build
print_status $? "All services built successfully"

# Optional: Test startup (commented out by default)
# echo "Testing service startup..."
# docker compose up -d
# sleep 30
# docker compose ps
# docker compose down

echo -e "${GREEN}🎉 All Docker builds completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'docker compose up -d' to start all services"
echo "2. Access frontend at http://localhost:4200"
echo "3. Access backend at http://localhost:3000"
echo "4. Monitor with 'docker compose logs -f'"
