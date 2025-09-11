export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  subtasks: SubTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed'
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface CreateSubTaskRequest {
  title: string;
}

export interface UpdateSubTaskRequest {
  title?: string;
  completed?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
