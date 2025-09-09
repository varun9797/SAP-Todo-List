# SAP Todo List Application

A full-stack todo management application built with Angular (frontend) and Node.js/TypeScript (backend). This application provides a comprehensive todo and subtask management system with a modern, responsive user interface.

## 🚀 Features

- ✅ **Complete Todo Management**: Create, read, update, and delete todos
- 📝 **Subtask Support**: Add and manage subtasks for better organization
- 🎯 **Status Tracking**: Track todo progress with different status levels
- 🔄 **Real-time Updates**: Responsive UI with immediate feedback
- 🛡️ **Type Safety**: Full TypeScript implementation across the stack
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔒 **Secure API**: Backend with comprehensive validation and error handling
- 🗄️ **Persistent Storage**: MongoDB database for reliable data persistence
- 🐳 **Docker Ready**: Full containerization with quality checks pipeline
- 🧪 **Quality Assured**: Integrated linting, testing, and type checking in builds

## 🏗️ Architecture

This project follows a modern full-stack architecture with clear separation of concerns:

```
SAP-Todo-List/
├── frontend/          # Angular application (UI)
├── backend/           # Node.js/Express API
└── README.md          # This file
```

### Technology Stack

**Frontend:**
- **Angular 20**: Modern web framework
- **TypeScript**: Type-safe development
- **SCSS**: Enhanced styling capabilities
- **RxJS**: Reactive programming for API calls

**Backend:**
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **Joi**: Input validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.4 or higher)
- **Angular CLI** (v20 or higher)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/varun9797/SAP-Todo-List.git
cd SAP-Todo-List
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB connection string
# PORT=3000
# FRONTEND_URL=http://localhost:4200
# MONGODB_URI=mongodb://localhost:27017/todoapp

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The frontend application will be available at `http://localhost:4200`

### 4. Database Setup

Make sure MongoDB is running:

```bash
# Start MongoDB (if installed locally)
mongod

# Or use MongoDB Compass/Atlas for cloud database
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Get all todos |
| GET | `/todos/:id` | Get todo by ID |
| POST | `/todos` | Create new todo |
| PUT | `/todos/:id` | Update todo |
| DELETE | `/todos/:id` | Delete todo |

#### Subtasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/todos/:todoId/subtasks` | Create subtask |
| PUT | `/todos/:todoId/subtasks/:subtaskId` | Update subtask |
| DELETE | `/todos/:todoId/subtasks/:subtaskId` | Delete subtask |

#### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

### Example API Usage

**Create a Todo:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Angular",
    "description": "Complete Angular tutorial and build a project",
    "status": "pending"
  }'
```

**Get All Todos:**
```bash
curl http://localhost:3000/api/todos
```

## 🧪 Development

### Backend Development

```bash
cd backend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build directory
npm run clean
```

### Frontend Development

```bash
cd frontend

# Development server
ng serve

# Build for production
ng build

# Run tests
ng test

# Generate new component
ng generate component component-name
```

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/           # Database configuration
│   ├── constants/        # Application constants
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── v1/              # API version 1
│   │   └── components/
│   │       └── todo/    # Todo feature module
│   │           ├── todoController.ts  # Business logic
│   │           ├── todoModel.ts       # Database models
│   │           ├── todoRouter.ts      # API routes
│   │           └── todoValidator.ts   # Input validation
│   └── index.ts         # Application entry point
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── todo/
│   │   │       ├── components/  # Todo components
│   │   │       ├── models/      # Type definitions
│   │   │       └── services/    # API services
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/todoapp

# Optional: For production
NODE_ENV=development
```

### CORS Configuration

The backend is configured to accept requests from the frontend URL specified in the environment variables.

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test  # Run tests (when test suite is implemented)
```

### Frontend Testing
```bash
cd frontend
ng test   # Run unit tests with Karma
ng e2e    # Run end-to-end tests
```

## 📦 Production Deployment

### Backend Deployment

1. Build the project:
```bash
cd backend
npm run build
```

2. Set production environment variables
3. Start the server:
```bash
npm start
```

### Frontend Deployment

1. Build for production:
```bash
cd frontend
ng build --configuration production
```

2. Serve the `dist/` directory with your preferred web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Varun**
- GitHub: [@varun9797](https://github.com/varun9797)

## � Additional Documentation

- **[Docker Setup Guide](DOCKER.md)** - Complete Docker containerization guide
- **[Docker Quality Checks](DOCKER_QUALITY_CHECKS.md)** - Linting and testing in Docker builds
- **[Backend API Documentation](backend/README.md)** - Backend API endpoints and usage
- **[Frontend Documentation](frontend/README.md)** - Frontend development guide

## �🐛 Known Issues

- No authentication system implemented yet
- Error logging could be enhanced

## 🧪 Quality Assurance

This project includes comprehensive quality checks:
- ✅ **TypeScript type checking** - Ensures type safety
- ✅ **ESLint code quality** - Enforces coding standards
- ✅ **Jest unit testing** - 102 passing tests
- ✅ **Docker quality pipeline** - Integrated in build process

Run quality checks:
```bash
# Backend quality checks
cd backend
npm run validate  # Runs type-check + lint + test

# Test Docker quality pipeline
./test-docker-build.sh
```

---

**Happy Coding! 🎉**
