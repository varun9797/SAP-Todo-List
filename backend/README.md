# Todo Management Backend API

A robust TypeScript Node.js backend API for managing todos and subtasks using Express.js and MongoDB with Mongoose.

## Features

- 🗄️ **MongoDB Integration**: Persistent data storage with Mongoose ODM
- 📝 **Full CRUD Operations**: Complete todo and subtask management
- 🔒 **Type Safety**: Full TypeScript implementation
- 🛡️ **Security**: Helmet.js for security headers, CORS configuration
- 📊 **Logging**: Morgan HTTP request logger
- ⚡ **Performance**: Optimized database queries with lean() 
- 🔄 **Error Handling**: Comprehensive error handling and validation
- 🎯 **RESTful API**: Clean and intuitive API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (if running locally):
```bash
mongod
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` file with your MongoDB connection string:
```env
PORT=3000
FRONTEND_URL=http://localhost:4200
MONGODB_URI=mongodb://localhost:27017/todoapp
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get todo by ID
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Subtasks
- `POST /api/todos/:todoId/subtasks` - Create subtask
- `PUT /api/todos/:todoId/subtasks/:subtaskId` - Update subtask
- `DELETE /api/todos/:todoId/subtasks/:subtaskId` - Delete subtask

### Health Check
- `GET /health` - API health status

## Data Models

### Todo
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  subtasks: SubTask[];
  createdAt: Date;
  updatedAt: Date;
}
```

### SubTask
```typescript
{
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Example API Usage

### Create a Todo
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn MongoDB",
    "description": "Complete MongoDB tutorial",
    "status": "pending"
  }'
```

### Add a Subtask
```bash
curl -X POST http://localhost:3000/api/todos/{todoId}/subtasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Install MongoDB"
  }'
```

## Architecture

The backend follows a clean, component-based architecture organized by version and feature:

- **Components**: Feature-based modules in `src/v1/components/`
  - **Todo Module**: `src/v1/components/todo/`
    - `todoModel.ts`: Mongoose schemas and database models
    - `todoController.ts`: Request handling and business logic  
    - `todoRouter.ts`: API endpoint definitions with validation
    - `todoValidator.ts`: Joi validation schemas and middleware
- **Config**: Database and application configuration (`src/config/`)
- **Types**: TypeScript type definitions (`src/types/`)

### Component Structure
```
src/v1/components/todo/
├── todoModel.ts      # Mongoose schemas (Todo, SubTask)
├── todoController.ts # All CRUD operations (todos + subtasks)
├── todoRouter.ts     # Express routes with validation
└── todoValidator.ts  # Joi validation schemas
```

This structure provides:
- ✨ **Clean Separation**: Each component has a single responsibility
- 🔄 **Easy Versioning**: API versions organized in separate folders
- � **Feature Grouping**: Related functionality grouped in feature folders
- �🛡️ **Validation**: Comprehensive Joi validation on all endpoints
- � **Modularity**: Self-contained feature modules for easy testing and maintenance
- 🎯 **Scalability**: Easy to add new features alongside the todo module

## Error Handling

The API provides consistent error responses:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Success Responses

All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

## Technologies Used

- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **TypeScript**: Type safety
- **Joi**: Input validation and schema validation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger
- **UUID**: Unique identifier generation

## Validation

The API uses Joi for comprehensive input validation:

- **Request Body Validation**: All POST/PUT requests validate required fields, data types, and constraints
- **Parameter Validation**: URL parameters are validated for correct format (UUIDs)
- **Custom Error Messages**: Clear, user-friendly validation error messages
- **Schema Reusability**: Validation schemas are organized and reusable across endpoints

Example validation error response:
```json
{
  "success": false,
  "error": "Validation failed",
  "data": [
    "Title is required",
    "Status must be one of: pending, in-progress, completed"
  ]
}
```
