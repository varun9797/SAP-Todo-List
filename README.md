# SAP Todo List Application

A modern full-stack todo management application with Angular frontend and Node.js backend.

## 🚀 Features

- ✅ Complete todo and subtask management
- 🎯 Status tracking
- 🛡️ Full TypeScript implementation
- 📱 Responsive design
- 🐳 Docker containerization with quality checks
- 🧪 Integrated testing and linting

## 🏗️ Project Structure

```
SAP-Todo-List/
├── backend/               # Node.js/Express API
├── frontend/              # Angular 20 application
├── docker-compose.yml     # Docker configuration
├── Makefile              # Build and deployment commands
├── DOCKER.md             # Docker setup guide
└── test-docker-build.sh  # Quality pipeline tests
```

## 📋 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Node.js** v18+ and **npm** (for local development)
- **MongoDB** (handled by Docker)

## 🚀 Quick Start with Docker (Recommended)

### Using Makefile Commands

```bash
# Clone the repository
git clone https://github.com/varun9797/SAP-Todo-List.git
cd SAP-Todo-List

# Quick setup with quality checks
make setup

# Or individual commands
make build-quality    # Build with linting and tests
make up              # Start all services
make logs            # View logs
make health          # Check service status
make down            # Stop services
```

### Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🛠️ Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make setup` | Quick setup (build + start) |
| `make build-quality` | Build with quality checks |
| `make build-ci` | Build with strict CI/CD checks |
| `make up` | Start production environment |
| `make down` | Stop all services |
| `make logs` | View service logs |
| `make health` | Check service status |
| `make clean` | Clean up containers and volumes |
| `make validate` | Run quality checks locally |
| `make test-build` | Run comprehensive build tests |

## 🔧 Local Development (Without Docker)

### Backend Setup
```bash
cd backend
npm install
npm run dev        # Development server with hot reload
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve           # Development server
```

### Database
Ensure MongoDB is running locally or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7-jammy
```

## � API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Subtasks
- `POST /api/todos/:todoId/subtasks` - Create subtask
- `PUT /api/todos/:todoId/subtasks/:subtaskId` - Update subtask
- `DELETE /api/todos/:todoId/subtasks/:subtaskId` - Delete subtask

## 🧪 Quality Assurance

### Run Tests and Linting
```bash
make validate          # All quality checks
make lint-frontend     # Frontend linting only
make lint-backend      # Backend linting only
make test-build        # Full Docker pipeline test
```

### Quality Features
- ✅ TypeScript type checking
- ✅ ESLint code quality
- ✅ Jest unit testing (backend)
- ✅ Karma/Jasmine testing (frontend)
- ✅ Docker quality pipeline

## 🐳 Docker Information

This project is fully containerized with:
- Production-ready Docker images
- Development containers with hot reload
- Quality checks integrated in builds
- Health monitoring for all services

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## 📄 Additional Documentation

- **[Docker Setup](DOCKER.md)** - Complete Docker guide
- **[Backend API](backend/README.md)** - Backend documentation
- **[Frontend Guide](frontend/README.md)** - Frontend documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run `make validate` to check code quality
4. Commit your changes
5. Submit a pull request

## 👤 Author

**Varun** - [@varun9797](https://github.com/varun9797)

---

**Get started with `make setup` and happy coding! 🎉**
