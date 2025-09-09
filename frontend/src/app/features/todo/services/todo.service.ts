import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Todo, CreateTodoRequest, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest, ApiResponse, SubTask } from '../models/todo.types';
import { RawTodo, RawSubTask } from '../models/raw-api.types';
import { environment } from '../../../../environments/environment';

/**
 * Service for managing todos and subtasks
 * Handles API communication and data transformation
 */
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/todos`;

  /**
   * Transforms a raw subtask from API response to application model
   * @param subtask - Raw subtask with string dates
   * @returns Transformed subtask with Date objects
   */
  private transformSubTask(subtask: RawSubTask): SubTask {
    return {
      ...subtask,
      createdAt: new Date(subtask.createdAt),
      updatedAt: new Date(subtask.updatedAt)
    };
  }

  /**
   * Transforms a raw todo from API response to application model
   * @param todo - Raw todo with string dates
   * @returns Transformed todo with Date objects
   */
  private transformTodo(todo: RawTodo): Todo {
    return {
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      subtasks: todo.subtasks.map((subtask: RawSubTask) => this.transformSubTask(subtask))
    };
  }

  /**
   * Generic method to handle API response transformation
   * @param response - API response
   * @param errorMessage - Default error message
   * @returns Response data
   */
  private handleResponse<T>(response: ApiResponse<T>, errorMessage: string): T {
    if (response.success && response.data !== undefined) {
      return response.data;
    }
    throw new Error(response.error || response.message || errorMessage);
  }

  // =================== TODO OPERATIONS ===================

  /**
   * Retrieves all todos from the server
   * @returns Observable of todo array
   */
  getAllTodos(): Observable<Todo[]> {
    return this.http.get<ApiResponse<RawTodo[]>>(this.apiUrl).pipe(
      map(response => {
        const todos = this.handleResponse(response, 'Failed to fetch todos');
        return todos.map(todo => this.transformTodo(todo));
      }),
      catchError(error => {
        console.error('Failed to fetch todos:', error);
        return throwError(() => new Error(error.message || 'Failed to fetch todos'));
      })
    );
  }

  /**
   * Retrieves a specific todo by ID
   * @param id - Todo ID
   * @returns Observable of todo
   */
  getTodoById(id: string): Observable<Todo> {
    return this.http.get<ApiResponse<RawTodo>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        const todo = this.handleResponse(response, 'Failed to fetch todo');
        return this.transformTodo(todo);
      }),
      catchError(error => {
        console.error('Failed to fetch todo:', error);
        return throwError(() => new Error(error.message || 'Failed to fetch todo'));
      })
    );
  }

  /**
   * Creates a new todo
   * @param todo - Todo creation request
   * @returns Observable of created todo
   */
  createTodo(todo: CreateTodoRequest): Observable<Todo> {
    return this.http.post<ApiResponse<RawTodo>>(this.apiUrl, todo).pipe(
      map(response => {
        const newTodo = this.handleResponse(response, 'Failed to create todo');
        return this.transformTodo(newTodo);
      }),
      catchError(error => {
        console.error('Failed to create todo:', error);
        return throwError(() => new Error(error.message || 'Failed to create todo'));
      })
    );
  }

  /**
   * Updates an existing todo
   * @param id - Todo ID
   * @param updates - Partial todo updates
   * @returns Observable of updated todo
   */
  updateTodo(id: string, updates: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<ApiResponse<RawTodo>>(`${this.apiUrl}/${id}`, updates).pipe(
      map(response => {
        const updatedTodo = this.handleResponse(response, 'Failed to update todo');
        return this.transformTodo(updatedTodo);
      }),
      catchError(error => {
        console.error('Failed to update todo:', error);
        return throwError(() => new Error(error.message || 'Failed to update todo'));
      })
    );
  }

  /**
   * Deletes a todo
   * @param id - Todo ID
   * @returns Observable void
   */
  deleteTodo(id: string): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || response.message || 'Failed to delete todo');
        }
      }),
      catchError(error => {
        console.error('Failed to delete todo:', error);
        return throwError(() => new Error(error.message || 'Failed to delete todo'));
      })
    );
  }

  // =================== SUBTASK OPERATIONS ===================

  /**
   * Creates a new subtask for a todo
   * @param todoId - Parent todo ID
   * @param subtask - Subtask creation request
   * @returns Observable of created subtask
   */
  createSubTask(todoId: string, subtask: CreateSubTaskRequest): Observable<SubTask> {
    return this.http.post<ApiResponse<RawSubTask>>(`${this.apiUrl}/${todoId}/subtasks`, subtask).pipe(
      map(response => {
        const newSubTask = this.handleResponse(response, 'Failed to create subtask');
        return this.transformSubTask(newSubTask);
      }),
      catchError(error => {
        console.error('Failed to create subtask:', error);
        return throwError(() => new Error(error.message || 'Failed to create subtask'));
      })
    );
  }

  /**
   * Updates an existing subtask
   * @param todoId - Parent todo ID
   * @param subtaskId - Subtask ID
   * @param updates - Partial subtask updates
   * @returns Observable of updated subtask
   */
  updateSubTask(todoId: string, subtaskId: string, updates: UpdateSubTaskRequest): Observable<SubTask> {
    return this.http.put<ApiResponse<RawSubTask>>(`${this.apiUrl}/${todoId}/subtasks/${subtaskId}`, updates).pipe(
      map(response => {
        const updatedSubTask = this.handleResponse(response, 'Failed to update subtask');
        return this.transformSubTask(updatedSubTask);
      }),
      catchError(error => {
        console.error('Failed to update subtask:', error);
        return throwError(() => new Error(error.message || 'Failed to update subtask'));
      })
    );
  }

  /**
   * Deletes a subtask
   * @param todoId - Parent todo ID
   * @param subtaskId - Subtask ID
   * @returns Observable void
   */
  deleteSubTask(todoId: string, subtaskId: string): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${todoId}/subtasks/${subtaskId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || response.message || 'Failed to delete subtask');
        }
      }),
      catchError(error => {
        console.error('Failed to delete subtask:', error);
        return throwError(() => new Error(error.message || 'Failed to delete subtask'));
      })
    );
  }
}
