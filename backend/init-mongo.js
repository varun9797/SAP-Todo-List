// MongoDB initialization script
db = db.getSiblingDB('todoapp');

// Create a user for the todo application
db.createUser({
  user: 'todouser',
  pwd: 'todopassword',
  roles: [
    {
      role: 'readWrite',
      db: 'todoapp'
    }
  ]
});

// Create collections with validation
db.createCollection('todos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'in-progress', 'completed'],
          description: 'must be a valid status and is required'
        },
        subtasks: {
          bsonType: 'array',
          description: 'must be an array'
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.todos.createIndex({ "status": 1 });
db.todos.createIndex({ "createdAt": -1 });

print('Database initialization completed successfully!');
