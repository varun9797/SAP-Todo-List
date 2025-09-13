import { Request, Response } from 'express';
import Joi from 'joi';
import {
  createTodoSchema,
  updateTodoSchema,
  todoIdSchema,
  createSubTaskSchema,
  updateSubTaskSchema,
  subtaskIdsSchema,
  validate,
  validateCreateTodo,
  validateUpdateTodo,
  validateTodoId
} from '../../../../v1/components/todo/todoValidator';

describe('TodoValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Joi Schemas', () => {
    describe('createTodoSchema', () => {
      it('should validate valid todo creation data', () => {
        const validData = {
          title: 'Test Todo',
          description: 'Test description',
          status: 'pending'
        };

        const { error } = createTodoSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should require title field', () => {
        const invalidData = {
          description: 'Test description'
        };

        const { error } = createTodoSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Title is required');
      });

      it('should validate title length constraints', () => {
        const invalidData = {
          title: '',
          description: 'Test description'
        };

        const { error } = createTodoSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Title is required');

        const tooLongTitle = 'a'.repeat(201);
        const { error: lengthError } = createTodoSchema.validate({
          title: tooLongTitle
        });
        expect(lengthError).toBeDefined();
        expect(lengthError?.details[0].message).toContain('must not exceed 200 characters');
      });

      it('should validate status enum values', () => {
        const validStatuses = ['pending', 'in-progress', 'completed'];

        validStatuses.forEach(status => {
          const { error } = createTodoSchema.validate({
            title: 'Test Todo',
            status
          });
          expect(error).toBeUndefined();
        });

        const { error } = createTodoSchema.validate({
          title: 'Test Todo',
          status: 'invalid-status'
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Status must be one of');
      });

      it('should allow optional description', () => {
        const { error } = createTodoSchema.validate({
          title: 'Test Todo'
        });
        expect(error).toBeUndefined();

        const { error: emptyError } = createTodoSchema.validate({
          title: 'Test Todo',
          description: ''
        });
        expect(emptyError).toBeUndefined();
      });

      it('should validate description length', () => {
        const tooLongDescription = 'a'.repeat(1001);
        const { error } = createTodoSchema.validate({
          title: 'Test Todo',
          description: tooLongDescription
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must not exceed 1000 characters');
      });
    });

    describe('updateTodoSchema', () => {
      it('should allow partial updates', () => {
        const partialData = {
          title: 'Updated Title'
        };

        const { error } = updateTodoSchema.validate(partialData);
        expect(error).toBeUndefined();
      });

      it('should validate title when provided', () => {
        const { error } = updateTodoSchema.validate({
          title: ''
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Title cannot be empty');
      });

      it('should allow all fields to be optional', () => {
        const { error } = updateTodoSchema.validate({});
        expect(error).toBeUndefined();
      });
    });

    describe('todoIdSchema', () => {
      it('should validate UUID format', () => {
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';
        const { error } = todoIdSchema.validate({ id: validUuid });
        expect(error).toBeUndefined();
      });

      it('should reject invalid UUID format', () => {
        const { error } = todoIdSchema.validate({ id: 'invalid-uuid' });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must be a valid GUID');
      });

      it('should require id field', () => {
        const { error } = todoIdSchema.validate({});
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Todo ID is required');
      });
    });

    describe('createSubTaskSchema', () => {
      it('should validate valid subtask data', () => {
        const { error } = createSubTaskSchema.validate({
          title: 'Test Subtask'
        });
        expect(error).toBeUndefined();
      });

      it('should require title field', () => {
        const { error } = createSubTaskSchema.validate({});
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('Title is required');
      });

      it('should validate title length', () => {
        const tooLongTitle = 'a'.repeat(201);
        const { error } = createSubTaskSchema.validate({
          title: tooLongTitle
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must not exceed 200 characters');
      });
    });

    describe('updateSubTaskSchema', () => {
      it('should allow optional fields', () => {
        const { error } = updateSubTaskSchema.validate({});
        expect(error).toBeUndefined();
      });

      it('should validate completed field type', () => {
        const { error } = updateSubTaskSchema.validate({
          completed: 'not-a-boolean'
        });
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain('must be a boolean');
      });

      it('should accept valid boolean values', () => {
        const { error: trueError } = updateSubTaskSchema.validate({
          completed: true
        });
        expect(trueError).toBeUndefined();

        const { error: falseError } = updateSubTaskSchema.validate({
          completed: false
        });
        expect(falseError).toBeUndefined();
      });
    });

    describe('subtaskIdsSchema', () => {
      it('should validate both todoId and subtaskId', () => {
        const validUuid1 = '550e8400-e29b-41d4-a716-446655440000';
        const validUuid2 = '550e8400-e29b-41d4-a716-446655440001';

        const { error } = subtaskIdsSchema.validate({
          todoId: validUuid1,
          subtaskId: validUuid2
        });
        expect(error).toBeUndefined();
      });

      it('should require both UUID fields', () => {
        const { error } = subtaskIdsSchema.validate({});
        expect(error).toBeDefined();
        expect(error?.details).toHaveLength(1); // Joi stops at first required field
        expect(error?.details[0].message).toBe('Todo ID is required');
      });
    });
  });

  describe('Validation Middleware', () => {
    describe('validate function', () => {
      it('should create middleware that validates request body', () => {
        const middleware = validate(createTodoSchema, 'body');
        expect(typeof middleware).toBe('function');
        expect(middleware.length).toBe(3); // req, res, next
      });

      it('should call next() when validation passes', () => {
        const middleware = validate(createTodoSchema, 'body');
        mockRequest.body = {
          title: 'Valid Todo',
          description: 'Valid description'
        };

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it('should return 400 error when validation fails', () => {
        const middleware = validate(createTodoSchema, 'body');
        mockRequest.body = {
          // Missing required title
          description: 'Valid description'
        };

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          data: expect.arrayContaining([expect.stringContaining('Title is required')])
        });
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should validate request params when specified', () => {
        const middleware = validate(todoIdSchema, 'params');
        mockRequest.params = {
          id: 'invalid-uuid'
        };

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(nextFunction).not.toHaveBeenCalled();
      });

      it('should validate request query when specified', () => {
        const querySchema = Joi.object({
          page: Joi.number().min(1).required()
        });

        const middleware = validate(querySchema, 'query');
        mockRequest.query = {
          page: 'invalid-number'
        };

        middleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });

    describe('Pre-configured validators', () => {
      it('should have validateCreateTodo middleware', () => {
        expect(typeof validateCreateTodo).toBe('function');
        expect(validateCreateTodo.length).toBe(3);
      });

      it('should have validateUpdateTodo as array of middlewares', () => {
        expect(Array.isArray(validateUpdateTodo)).toBe(true);
        expect(validateUpdateTodo).toHaveLength(2);
        validateUpdateTodo.forEach(middleware => {
          expect(typeof middleware).toBe('function');
          expect(middleware.length).toBe(3);
        });
      });

      it('should have validateTodoId middleware', () => {
        expect(typeof validateTodoId).toBe('function');
        expect(validateTodoId.length).toBe(3);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle multiple validation errors', () => {
      const middleware = validate(createTodoSchema, 'body');
      mockRequest.body = {
        title: '', // Empty title
        description: 'a'.repeat(1001), // Too long description
        status: 'invalid-status' // Invalid status
      };

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        data: expect.arrayContaining([
          expect.stringContaining('Title'),
          expect.stringContaining('Description'),
          expect.stringContaining('Status')
        ])
      });
    });

    it('should format error messages properly', () => {
      const middleware = validate(createTodoSchema, 'body');
      mockRequest.body = {
        title: 'a'.repeat(201) // Too long title
      };

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        data: expect.arrayContaining([
          expect.stringContaining('must not exceed 200 characters')
        ])
      });
    });
  });
});
