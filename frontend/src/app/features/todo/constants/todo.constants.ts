/**
 * Todo Status Constants
 * Centralized location for all todo status values and related constants
 */

export const TODO_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    ALL: 'all'
} as const;

export const TODO_STATUS_LABELS = {
    [TODO_STATUS.PENDING]: 'Pending',
    [TODO_STATUS.IN_PROGRESS]: 'In Progress',
    [TODO_STATUS.COMPLETED]: 'Completed',
    [TODO_STATUS.ALL]: 'All'
} as const;

export const TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: TODO_STATUS_LABELS[TODO_STATUS.PENDING] },
    { value: TODO_STATUS.IN_PROGRESS, label: TODO_STATUS_LABELS[TODO_STATUS.IN_PROGRESS] },
    { value: TODO_STATUS.COMPLETED, label: TODO_STATUS_LABELS[TODO_STATUS.COMPLETED] }
] as const;

export const FILTER_OPTIONS = [
    { value: TODO_STATUS.ALL, label: TODO_STATUS_LABELS[TODO_STATUS.ALL] },
    ...TODO_STATUS_OPTIONS
] as const;

// Type definitions
export type TodoStatus = typeof TODO_STATUS[keyof typeof TODO_STATUS];
export type FilterStatus = TodoStatus | typeof TODO_STATUS.ALL;

/**
 * UI Messages Constants
 */
export const SUCCESS_MESSAGES = {
    TODO_CREATED: 'Todo created successfully!',
    TODO_UPDATED: 'Todo updated successfully!',
    TODO_DELETED: 'Todo deleted successfully!',
    SUBTASK_ADDED: 'Subtask added successfully!',
    SUBTASK_UPDATED: 'Subtask updated successfully!',
    SUBTASK_DELETED: 'Subtask deleted successfully!'
} as const;

export const ERROR_MESSAGES = {
    LOAD_TODOS_FAILED: 'Failed to load todos. Please try again.',
    CREATE_TODO_FAILED: 'Failed to create todo. Please try again.'
} as const;

/**
 * Form Defaults
 */
export const DEFAULT_TODO = {
    title: '',
    description: '',
    status: TODO_STATUS.PENDING,
} as const;

/**
 * UI Timing Constants
 */
export const UI_TIMING = {
    SUCCESS_MESSAGE_TIMEOUT: 3000
} as const;

