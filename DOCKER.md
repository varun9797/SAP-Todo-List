# SAP Todo List - Docker Setup

This project is fully containerized using Docker and Docker Compose for easy development and deployment.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Project Structure

```
SAP-Todo-List/
├── docker-compose.yml          # Production setup
├── .env                        # Environment variables
├── backend/
│   ├── Dockerfile              # Backend image
│   └── .dockerignore
└── frontend/
    ├── Dockerfile              # Frontend image
    ├── .dockerignore
    └── nginx.conf              # Nginx configuration
```

## Quick Start

### Production Environment

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd SAP-Todo-List
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000
   - Health checks: 
     - Backend: http://localhost:3000/health
     - Frontend: http://localhost:4200/health

4. **Stop all services:**
   ```bash
   docker compose down
   ```

## Services

### MongoDB (Database)
- **Port:** 27018 (external) → 27017 (internal)
- **Database:** todoapp
- **Credentials:** admin/password123
- **Data persistence:** MongoDB data is persisted in Docker volumes
- **Note:** External port 27018 is used to avoid conflicts with local MongoDB installations

### Backend (Node.js/Express)
- **Port:** 3000
- **Environment:** Node.js with TypeScript
- **Features:** 
  - RESTful API for todo management
  - MongoDB integration
  - CORS enabled
  - Security headers with Helmet
  - Health check endpoint

### Frontend (Angular)
- **Port:** 4200 (development) / 80 (production)
- **Environment:** Angular 20 with Nginx (production)
- **Features:**
  - Modern Angular application
  - Responsive design
  - Production-optimized build

## Environment Variables

The following environment variables can be configured in `.env`:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DB_NAME=todoapp

# Backend Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:4200

# MongoDB Connection
MONGO_URI=mongodb://admin:password123@mongodb:27017/todoapp?authSource=admin
```

## Docker Commands

### Building Images
```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend
```

### Managing Services
```bash
# Start services in background
docker compose up -d

# Start specific service
docker compose up -d mongodb

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a service
docker compose restart backend

# Execute commands in running container
docker compose exec backend sh
docker compose exec mongodb mongosh
```

### Data Management
```bash
# Remove all containers and networks
docker compose down

# Remove everything including volumes (WARNING: This deletes all data)
docker compose down -v

# View volume information
docker volume ls
docker volume inspect sap-todo-list_mongodb_data
```

## Health Checks

All services include health checks:

- **MongoDB:** Checks database connectivity
- **Backend:** Checks HTTP health endpoint
- **Frontend:** Checks Nginx availability

Monitor health status:
```bash
docker compose ps
```

## Production Deployment

For production deployment:

1. **Update environment variables** in `.env` file
2. **Build and start services:**
   ```bash
   docker compose up -d --build
   ```
3. **Monitor logs:**
   ```bash
   docker compose logs -f
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - MongoDB uses port 27018 externally to avoid conflicts with local installations
   - Ensure ports 3000, 4200, and 27018 are not in use
   - Modify port mappings in docker-compose.yml if needed

2. **Database connection issues:**
   - Check if MongoDB container is healthy: `docker compose ps`
   - View MongoDB logs: `docker compose logs mongodb`

3. **Frontend build issues:**
   - Clear Docker build cache: `docker builder prune`
   - Rebuild frontend: `docker compose build --no-cache frontend`

4. **Backend build issues:**
   - Ensure TypeScript dependencies are available during build
   - Backend uses multi-stage build: first stage includes dev dependencies for compilation
   - Check build logs: `docker compose logs backend`

5. **Frontend nginx user conflicts:**
   - Fixed: Uses existing nginx user instead of creating duplicate group
   - If issues persist, check nginx permissions with: `docker compose exec frontend ls -la /usr/share/nginx/html`

6. **Build cache issues:**
   - Clear all Docker build cache: `docker builder prune -a`
   - Remove all containers and rebuild: `docker compose down && docker compose up --build`

### Useful Commands
```bash
# View container resource usage
docker stats

# Clean up unused Docker resources
docker system prune

# View detailed container information
docker inspect <container_name>

# Access container shell
docker compose exec <service_name> sh
```

## Development Workflow

1. **Start development environment:**
   ```bash
   docker compose up -d
   ```

2. **Make code changes** - rebuild containers as needed

3. **View logs to monitor changes:**
   ```bash
   docker compose logs -f backend
   ```

4. **Test changes** at http://localhost:4200

5. **Stop when done:**
   ```bash
   docker compose down
   ```

## Security Considerations

- Default passwords should be changed for production
- Environment variables should be properly secured
- Consider using Docker secrets for sensitive data
- Regular security updates for base images
- Network isolation between services

## Performance Optimization

- Multi-stage builds reduce image sizes
- Nginx serves static frontend files efficiently
- Health checks ensure service availability
- Resource limits can be added to services
- Production builds are optimized for performance
