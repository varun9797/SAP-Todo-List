import mongoose from 'mongoose';
import { TodoModel, ITodo, ISubTask } from '../../../../v1/components/todo/todoModel';

describe('TodoModel', () => {
  describe('Schema Validation', () => {
    it('should create a valid todo with required fields', () => {
      const todoData = {
        id: 'test-id-123',
        title: 'Test Todo',
        description: 'Test description',
        status: 'pending',
        subtasks: []
      };

      const todo = new TodoModel(todoData);
      const validationError = todo.validateSync();

      expect(validationError).toBeUndefined();
      expect(todo.id).toBe('test-id-123');
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test description');
      expect(todo.status).toBe('pending');
      expect(todo.subtasks).toEqual([]);
    });

    it('should fail validation when required fields are missing', () => {
      const todo = new TodoModel({});
      const validationError = todo.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.id).toBeDefined();
      expect(validationError?.errors.title).toBeDefined();
    });

    it('should have default values for optional fields', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo'
      });

      expect(todo.description).toBe('');
      expect(todo.status).toBe('pending');
      expect(todo.subtasks).toEqual([]);
    });

    it('should validate status enum values', () => {
      const validStatuses = ['pending', 'in-progress', 'completed'];

      validStatuses.forEach(status => {
        const todo = new TodoModel({
          id: 'test-id',
          title: 'Test Todo',
          status
        });
        const validationError = todo.validateSync();
        expect(validationError).toBeUndefined();
      });

      // Test invalid status
      const invalidTodo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        status: 'invalid-status' as any
      });
      const validationError = invalidTodo.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError?.errors.status).toBeDefined();
    });

    it('should validate subtask schema', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Test Subtask',
            completed: false
          }
        ]
      });

      const validationError = todo.validateSync();
      expect(validationError).toBeUndefined();
      expect(todo.subtasks[0].id).toBe('subtask-1');
      expect(todo.subtasks[0].title).toBe('Test Subtask');
      expect(todo.subtasks[0].completed).toBe(false);
    });

    it('should fail validation when subtask required fields are missing', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        subtasks: [
          {
            // Missing required fields
            completed: false
          }
        ]
      });

      const validationError = todo.validateSync();
      expect(validationError).toBeDefined();
    });

    it('should have default completed value for subtasks', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Test Subtask'
            // completed not provided, should default to false
          }
        ]
      });

      expect(todo.subtasks[0].completed).toBe(false);
    });

    it('should include timestamps for todo', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo'
      });

      // Timestamps are added by Mongoose automatically
      expect(todo.schema.get('timestamps')).toBe(true);
    });

    it('should include timestamps for subtasks', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Test Subtask'
          }
        ]
      });

      // Check if subtask schema has timestamps
      const subtaskPath = todo.schema.path('subtasks') as any;
      expect(subtaskPath.schema.get('timestamps')).toBe(true);
    });

    it('should enforce unique constraint on id field', () => {
      // Note: This test checks schema definition, actual uniqueness is enforced by MongoDB
      const idPath = TodoModel.schema.path('id') as any;
      expect(idPath.options.unique).toBe(true);
    });
  });

  describe('Interface Compliance', () => {
    it('should create todo with interface-compatible data', () => {
      const todoData = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test description',
        status: 'pending' as const,
        subtasks: []
      };

      const todo = new TodoModel(todoData);
      expect(todo.id).toBe(todoData.id);
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.status).toBe(todoData.status);
      expect(todo.subtasks).toEqual(todoData.subtasks);
    });

    it('should create subtask with interface-compatible data', () => {
      const subtaskData = {
        id: 'subtask-id',
        title: 'Test Subtask',
        completed: true
      };

      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo',
        subtasks: [subtaskData]
      });

      const subtask = todo.subtasks[0];
      expect(subtask.id).toBe(subtaskData.id);
      expect(subtask.title).toBe(subtaskData.title);
      expect(subtask.completed).toBe(subtaskData.completed);
    });
  });

  describe('Model Methods', () => {
    it('should create model instance with new operator', () => {
      const todo = new TodoModel({
        id: 'test-id',
        title: 'Test Todo'
      });

      expect(todo).toBeInstanceOf(TodoModel);
      expect(todo.constructor.name).toBe('model');
    });

    it('should have access to Mongoose model methods', () => {
      expect(typeof TodoModel.find).toBe('function');
      expect(typeof TodoModel.findOne).toBe('function');
      expect(typeof TodoModel.findOneAndUpdate).toBe('function');
      expect(typeof TodoModel.deleteOne).toBe('function');
      expect(typeof TodoModel.updateOne).toBe('function');
    });
  });
});
