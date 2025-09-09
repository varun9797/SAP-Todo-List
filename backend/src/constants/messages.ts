/**
 * Application Messages
 * Centralized location for all user-facing messages and error strings
 */

// Success Messages
export const SUCCESS_MESSAGES = {
  TODO_CREATED: 'Todo created successfully',
  TODO_UPDATED: 'Todo updated successfully',
  TODO_DELETED: 'Todo deleted successfully',
  SUBTASK_CREATED: 'Subtask created successfully',
  SUBTASK_UPDATED: 'Subtask updated successfully',
  SUBTASK_DELETED: 'Subtask deleted successfully'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Todo errors
  TODO_NOT_FOUND: 'Todo not found',
  TODOS_FETCH_FAILED: 'Failed to fetch todos',
  TODO_FETCH_FAILED: 'Failed to fetch todo',
  TODO_CREATE_FAILED: 'Failed to create todo',
  TODO_UPDATE_FAILED: 'Failed to update todo',
  TODO_DELETE_FAILED: 'Failed to delete todo',
  
  // Subtask errors
  SUBTASK_NOT_FOUND: 'Subtask not found',
  SUBTASK_CREATE_FAILED: 'Failed to create subtask',
  SUBTASK_UPDATE_FAILED: 'Failed to update subtask',
  SUBTASK_DELETE_FAILED: 'Failed to delete subtask',
  TODO_OR_SUBTASK_NOT_FOUND: 'Todo or subtask not found',
  
  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden'
} as const;

// Log Messages
export const LOG_MESSAGES = {
  TODO_FETCH_ERROR: 'Error fetching todos:',
  TODO_GET_ERROR: 'Error fetching todo:',
  TODO_CREATE_ERROR: 'Error creating todo:',
  TODO_UPDATE_ERROR: 'Error updating todo:',
  TODO_DELETE_ERROR: 'Error deleting todo:',
  SUBTASK_CREATE_ERROR: 'Error creating subtask:',
  SUBTASK_UPDATE_ERROR: 'Error updating subtask:',
  SUBTASK_DELETE_ERROR: 'Error deleting subtask:'
} as const;

// Default Values
export const DEFAULT_VALUES = {
  TODO_STATUS: 'pending',
  EMPTY_DESCRIPTION: '',
  SUBTASK_COMPLETED: false
} as const;

export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type LogMessage = typeof LOG_MESSAGES[keyof typeof LOG_MESSAGES];
