/**
 * Raw API response interfaces
 * These represent the data structure returned by the server before transformation
 */

/**
 * Raw subtask interface with string dates from server
 */
export interface RawSubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw todo interface with string dates from server
 */
export interface RawTodo {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  subtasks: RawSubTask[];
}
