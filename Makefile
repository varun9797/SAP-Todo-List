# Makefile for SAP Todo List Docker operations

.PHONY: help build up down logs clean dev dev-down dev-logs restart health

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start production environment"
	@echo "  down      - Stop production environment"
	@echo "  logs      - View production logs"
	@echo "  dev       - Start development environment"
	@echo "  dev-down  - Stop development environment"
	@echo "  dev-logs  - View development logs"
	@echo "  restart   - Restart all services"
	@echo "  health    - Check service health status"
	@echo "  clean     - Clean up containers, networks, and volumes"

# Production commands
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

# Development commands
dev:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

# Utility commands
health:
	docker compose ps

clean:
	docker compose down -v
	docker system prune -f

# Quick setup for new users
setup: build up
	@echo "🚀 Todo application is starting..."
	@echo "📝 Frontend: http://localhost:4200"
	@echo "🔧 Backend: http://localhost:3000"
	@echo "💾 MongoDB: localhost:27017"
	@echo ""
	@echo "Run 'make logs' to view startup logs"
	@echo "Run 'make health' to check service status"
