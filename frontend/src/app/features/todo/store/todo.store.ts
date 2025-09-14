import { Injectable, signal, computed, inject } from '@angular/core';
import { TodoService } from '../services/todo.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Todo, SubTask, CreateTodoRequest, UpdateTodoRequest, CreateSubTaskRequest } from '../models/todo.types';
import { TODO_STATUS, FilterStatus, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/todo.constants';

@Injectable({
    providedIn: 'root'
})
export class TodoStore {
    private readonly todoService = inject(TodoService);
    private readonly notificationService = inject(NotificationService);

    // Core state signals
    private readonly _todos = signal<Todo[]>([]);
    private readonly _loading = signal(false);
    private readonly _filter = signal<FilterStatus>(TODO_STATUS.ALL);

    // Public readonly state
    readonly todos = this._todos.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly filter = this._filter.asReadonly();

    // Computed state
    readonly filteredTodos = computed(() => {
        const allTodos = this._todos();
        const currentFilter = this._filter();

        if (currentFilter === TODO_STATUS.ALL) {
            return allTodos;
        }
        return allTodos.filter(todo => todo.status === currentFilter);
    });

    readonly counts = computed(() => {
        const allTodos = this._todos();
        return {
            pending: allTodos.filter(todo => todo.status === TODO_STATUS.PENDING).length,
            inProgress: allTodos.filter(todo => todo.status === TODO_STATUS.IN_PROGRESS).length,
            completed: allTodos.filter(todo => todo.status === TODO_STATUS.COMPLETED).length,
            total: allTodos.length
        };

    });

    // Actions
    async loadTodos(): Promise<void> {
        this._loading.set(true);

        this.todoService.getAllTodos().subscribe({
            next: (todos) => {
                this._todos.set(todos);
                this._loading.set(false);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.LOAD_TODOS_FAILED);
                this._loading.set(false);
            }
        });
    }

    async createTodo(request: CreateTodoRequest): Promise<void> {
        this._loading.set(true);

        this.todoService.createTodo(request).subscribe({
            next: (newTodo) => {
                this._todos.update(todos => [...todos, newTodo]);
                this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_CREATED);
                this._loading.set(false);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.CREATE_TODO_FAILED);
                this._loading.set(false);
            }
        });
    }

    async updateTodo(todoId: string, updates: UpdateTodoRequest): Promise<void> {
        this.todoService.updateTodo(todoId, updates).subscribe({
            next: (updatedTodo) => {
                this._todos.update(todos =>
                    todos.map(todo => todo.id === todoId ? updatedTodo : todo)
                );
                this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_UPDATED);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.UPDATE_TODO_FAILED);
            }
        });
    }

    async deleteTodo(todoId: string): Promise<void> {
        // Show confirmation dialog first
        const confirmed = await this.notificationService.showConfirmation(
            'Are you sure you want to delete this todo?',
            'Delete Todo'
        );

        if (!confirmed) return;

        this.todoService.deleteTodo(todoId).subscribe({
            next: () => {
                this._todos.update(todos => todos.filter(todo => todo.id !== todoId));
                this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_DELETED);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.DELETE_TODO_FAILED);
            }
        });
    }

    async createSubtask(todoId: string, request: CreateSubTaskRequest): Promise<void> {
        this.todoService.createSubTask(todoId, request).subscribe({
            next: (subtask: SubTask) => {
                this._todos.update(todos =>
                    todos.map(todo =>
                        todo.id === todoId
                            ? { ...todo, subtasks: [...todo.subtasks, subtask] }
                            : todo
                    )
                );
                this.notificationService.showSuccess(SUCCESS_MESSAGES.SUBTASK_ADDED);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.ADD_SUBTASK_FAILED);
            }
        });
    }

    async updateSubtask(todoId: string, subtaskId: string, updates: Partial<SubTask>): Promise<void> {
        this.todoService.updateSubTask(todoId, subtaskId, updates).subscribe({
            next: () => {
                this._todos.update(todos =>
                    todos.map(todo =>
                        todo.id === todoId
                            ? {
                                ...todo,
                                subtasks: todo.subtasks.map(subtask =>
                                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                                )
                            }
                            : todo
                    )
                );
                this.notificationService.showSuccess(SUCCESS_MESSAGES.SUBTASK_UPDATED);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.UPDATE_SUBTASK_FAILED);
            }
        });
    }

    async deleteSubtask(todoId: string, subtaskId: string): Promise<void> {
        // Show confirmation dialog first
        const confirmed = await this.notificationService.showConfirmation(
            'Are you sure you want to delete this subtask?',
            'Delete Subtask'
        );

        if (!confirmed) return;

        this.todoService.deleteSubTask(todoId, subtaskId).subscribe({
            next: () => {
                this._todos.update(todos =>
                    todos.map(todo =>
                        todo.id === todoId
                            ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
                            : todo
                    )
                );
                this.notificationService.showSuccess(SUCCESS_MESSAGES.SUBTASK_DELETED);
            },
            error: (_err) => {
                this.notificationService.showError(ERROR_MESSAGES.DELETE_SUBTASK_FAILED);
            }
        });
    }

    // Filter actions
    setFilter(filter: FilterStatus): void {
        this._filter.set(filter);
    }

    clearFilter(): void {
        this._filter.set(TODO_STATUS.ALL);
    }

    // Utility methods
    getTodoById(todoId: string): Todo | undefined {
        return this._todos().find(todo => todo.id === todoId);
    }

    getSubtaskById(todoId: string, subtaskId: string): SubTask | undefined {
        const todo = this.getTodoById(todoId);
        return todo?.subtasks.find(subtask => subtask.id === subtaskId);
    }
}
