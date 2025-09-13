# Makefile for SAP Todo List Docker operations

.PHONY: help build build-quality build-ci up down logs clean restart health test-build validate

# Default target
help:
	@echo "Available commands:"
	@echo "  build         - Build all Docker images (standard)"
	@echo "  build-quality - Build with quality checks (lint + tests) for both frontend and backend"
	@echo "  build-ci      - Build with strict quality checks for CI/CD for both frontend and backend"
	@echo "  test-build    - Run comprehensive build pipeline tests"
	@echo "  validate      - Run quality checks locally for both frontend and backend before building"
	@echo "  up            - Start production environment"
	@echo "  down          - Stop production environment"
	@echo "  logs          - View production logs"
	@echo "  restart       - Restart all services"
	@echo "  health        - Check service health status"
	@echo "  clean         - Clean up containers, networks, and volumes"

# Production commands
build:
	@echo "🐳 Building standard Docker images..."
	docker compose build

build-quality:
	@echo "🧪 Building with quality checks (lint + tests)..."
	@echo "📝 This will run TypeScript checking, ESLint, and Jest tests"
	cd backend && docker build -t todo-backend:quality .
	cd frontend && docker build -t todo-frontend:quality .
	@echo "✅ Build completed with quality checks!"

build-ci:
	@echo "🔒 Building with strict CI/CD quality checks..."
	cd backend && docker build -f Dockerfile.ci -t todo-backend:ci .
	cd frontend && docker build -f Dockerfile.ci -t todo-frontend:ci .
	@echo "✅ CI/CD build completed with strict quality checks!"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

# Utility commands
health:
	docker compose ps

clean:
	docker compose down -v
	docker system prune -f

# Quality assurance commands
test-build:
	@echo "🧪 Running comprehensive build pipeline tests..."
	./test-docker-build.sh

validate:
	@echo "🔍 Running local quality checks before Docker build..."
	@echo "📝 Checking backend code quality..."
	cd backend && npm run type-check
	cd backend && npm run lint
	cd backend && npm test
	@echo "📝 Checking frontend code quality..."
	cd frontend && npm run lint
	@echo "⚠️ Note: Frontend tests may require Chrome for headless testing"
	@echo "✅ Local validation completed!"

# Quick setup for new users
setup: build-quality up
	@echo "🚀 Todo application is starting with quality checks..."
	@echo "📝 Frontend: http://localhost:4200"
	@echo "🔧 Backend: http://localhost:3000"
	@echo "💾 MongoDB: localhost:27017"
	@echo ""
	@echo "Run 'make logs' to view startup logs"
	@echo "Run 'make health' to check service status"
