/**
 * Database Query Options
 * Centralized location for MongoDB query configurations
 */
export const QUERY_OPTIONS = {
  LEAN: { lean: true },
  NEW_AND_LEAN: { new: true, lean: true },
  NEW: { new: true },
} as const;

/**
 * Database Field Names
 * Centralized field name constants
 */
export const DB_FIELDS = {
  ID: 'id',
  TITLE: 'title',
  DESCRIPTION: 'description',
  STATUS: 'status',
  SUBTASKS: 'subtasks',
  SUBTASK_ID: 'subtasks.id',
  SUBTASK_TITLE: 'subtasks.$.title',
  SUBTASK_COMPLETED: 'subtasks.$.completed',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;
