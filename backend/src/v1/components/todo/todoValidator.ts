import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../types';

// Joi validation schemas
export const createTodoSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional().messages({
    'any.only': 'Status must be one of: pending, in-progress, completed'
  })
});

export const updateTodoSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters'
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters'
  }),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional().messages({
    'any.only': 'Status must be one of: pending, in-progress, completed'
  })
});

export const todoIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Todo ID must be a valid UUID',
    'any.required': 'Todo ID is required'
  })
});

export const createSubTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required'
  })
});

export const updateSubTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title must not exceed 200 characters'
  }),
  completed: Joi.boolean().optional().messages({
    'boolean.base': 'Completed must be a boolean value'
  })
});

export const subtaskIdsSchema = Joi.object({
  todoId: Joi.string().uuid().required().messages({
    'string.uuid': 'Todo ID must be a valid UUID',
    'any.required': 'Todo ID is required'
  }),
  subtaskId: Joi.string().uuid().required().messages({
    'string.uuid': 'Subtask ID must be a valid UUID',
    'any.required': 'Subtask ID is required'
  })
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errorMessages
      });
    }
    
    next();
  };
};

// Specific validation middleware
export const validateCreateTodo = validate(createTodoSchema, 'body');
export const validateUpdateTodo = [
  validate(todoIdSchema, 'params'),
  validate(updateTodoSchema, 'body')
];
export const validateTodoId = validate(todoIdSchema, 'params');
export const validateCreateSubTask = [
  validate(Joi.object({ todoId: Joi.string().uuid().required() }), 'params'),
  validate(createSubTaskSchema, 'body')
];
export const validateUpdateSubTask = [
  validate(subtaskIdsSchema, 'params'),
  validate(updateSubTaskSchema, 'body')
];
export const validateSubTaskIds = validate(subtaskIdsSchema, 'params');
