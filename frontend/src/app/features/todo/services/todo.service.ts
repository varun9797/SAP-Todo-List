import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Todo, CreateTodoRequest, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest, ApiResponse, SubTask } from '../models/todo.types';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/todos';

  // Todo operations
  getAllTodos(): Observable<Todo[]> {
    return this.http.get<ApiResponse<Todo[]>>(this.apiUrl).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            subtasks: todo.subtasks.map(subtask => ({
              ...subtask,
              createdAt: new Date(subtask.createdAt),
              updatedAt: new Date(subtask.updatedAt)
            }))
          }));
        }
        return [];
      })
    );
  }

  getTodoById(id: string): Observable<Todo> {
    return this.http.get<ApiResponse<Todo>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const todo = response.data;
          return {
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            subtasks: todo.subtasks.map(subtask => ({
              ...subtask,
              createdAt: new Date(subtask.createdAt),
              updatedAt: new Date(subtask.updatedAt)
            }))
          };
        }
        throw new Error(response.error || 'Failed to fetch todo');
      })
    );
  }

  createTodo(todo: CreateTodoRequest): Observable<Todo> {
    return this.http.post<ApiResponse<Todo>>(this.apiUrl, todo).pipe(
      map(response => {
        if (response.success && response.data) {
          const newTodo = response.data;
          return {
            ...newTodo,
            createdAt: new Date(newTodo.createdAt),
            updatedAt: new Date(newTodo.updatedAt),
            subtasks: newTodo.subtasks.map(subtask => ({
              ...subtask,
              createdAt: new Date(subtask.createdAt),
              updatedAt: new Date(subtask.updatedAt)
            }))
          };
        }
        throw new Error(response.error || 'Failed to create todo');
      })
    );
  }

  updateTodo(id: string, updates: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<ApiResponse<Todo>>(`${this.apiUrl}/${id}`, updates).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedTodo = response.data;
          return {
            ...updatedTodo,
            createdAt: new Date(updatedTodo.createdAt),
            updatedAt: new Date(updatedTodo.updatedAt),
            subtasks: updatedTodo.subtasks.map(subtask => ({
              ...subtask,
              createdAt: new Date(subtask.createdAt),
              updatedAt: new Date(subtask.updatedAt)
            }))
          };
        }
        throw new Error(response.error || 'Failed to update todo');
      })
    );
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete todo');
        }
      })
    );
  }

  // Subtask operations
  createSubTask(todoId: string, subtask: CreateSubTaskRequest): Observable<SubTask> {
    return this.http.post<ApiResponse<SubTask>>(`${this.apiUrl}/${todoId}/subtasks`, subtask).pipe(
      map(response => {
        if (response.success && response.data) {
          const newSubTask = response.data;
          return {
            ...newSubTask,
            createdAt: new Date(newSubTask.createdAt),
            updatedAt: new Date(newSubTask.updatedAt)
          };
        }
        throw new Error(response.error || 'Failed to create subtask');
      })
    );
  }

  updateSubTask(todoId: string, subtaskId: string, updates: UpdateSubTaskRequest): Observable<SubTask> {
    return this.http.put<ApiResponse<SubTask>>(`${this.apiUrl}/${todoId}/subtasks/${subtaskId}`, updates).pipe(
      map(response => {
        if (response.success && response.data) {
          const updatedSubTask = response.data;
          return {
            ...updatedSubTask,
            createdAt: new Date(updatedSubTask.createdAt),
            updatedAt: new Date(updatedSubTask.updatedAt)
          };
        }
        throw new Error(response.error || 'Failed to update subtask');
      })
    );
  }

  deleteSubTask(todoId: string, subtaskId: string): Observable<void> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${todoId}/subtasks/${subtaskId}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete subtask');
        }
      })
    );
  }
}
