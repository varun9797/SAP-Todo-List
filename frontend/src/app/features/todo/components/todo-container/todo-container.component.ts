import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TodoService } from '../../services/todo.service';
import { SharedService } from '../../services/shared.service';
// Update the import path to the correct location of NotificationService
import { Todo, SubTask, CreateSubTaskRequest } from '../../models/todo.types';
import {
  TODO_STATUS,
  FilterStatus,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from '../../constants/todo.constants';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-todo-container',
  imports: [TodoFormComponent, TodoListComponent, TodoFilterComponent, NotificationComponent, ButtonComponent],
  templateUrl: './todo-container.component.html',
  styleUrl: './todo-container.component.scss'
})
export class TodoContainerComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  private readonly sharedService = inject(SharedService);
  readonly notificationService = inject(NotificationService);

  // State management
  readonly todos = signal<Todo[]>([]);
  readonly isLoading = signal(false);
  readonly filterStatus = signal<FilterStatus>(TODO_STATUS.ALL);

  // Local notification signal for template binding
  readonly currentNotification = this.notificationService.notification;

  // Computed values
  readonly filteredTodos = computed(() => {
    const allTodos = this.todos();
    if (this.filterStatus() === TODO_STATUS.ALL) {
      return allTodos;
    }
    return allTodos.filter(todo => todo.status === this.filterStatus());
  });

  readonly pendingCount = computed(() =>
    this.todos().filter(todo => todo.status === TODO_STATUS.PENDING).length
  );

  readonly inProgressCount = computed(() =>
    this.todos().filter(todo => todo.status === TODO_STATUS.IN_PROGRESS).length
  );

  readonly completedCount = computed(() =>
    this.todos().filter(todo => todo.status === TODO_STATUS.COMPLETED).length
  );

  ngOnInit(): void {
    this.loadTodos();
    this.setupSharedServiceSubscriptions();
  }

  private setupSharedServiceSubscriptions(): void {
    this.sharedService._addItemToList$.subscribe({
      next: (newTodo: Todo) => {
        if (newTodo && newTodo.id) {
          this.addNewTodoToList(newTodo);
        }
      }
    });

    this.sharedService._isErrorWhileAddingTodo$.subscribe({
      next: (isError: boolean) => {
        if (isError) {
          this.notificationService.showError(ERROR_MESSAGES.CREATE_TODO_FAILED);
          this.isLoading.set(false);
        }
      }
    });
  }

  loadTodos(): void {
    this.isLoading.set(true);

    this.todoService.getAllTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
      },
      error: (_err) => {
        this.notificationService.showError(ERROR_MESSAGES.LOAD_TODOS_FAILED);
        this.isLoading.set(false);
      }
    });
  }

  onTodoUpdated(updatedTodo: Todo): void {
    this.todos.update(todos =>
      todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
    );
    this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_UPDATED);
  }

  onTodoDeleted(todoId: string): void {
    this.todos.update(todos => todos.filter(todo => todo.id !== todoId));
    this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_DELETED);
  }

  onSubtaskAdded(todoId: string, request: CreateSubTaskRequest): void {
    this.todoService.createSubTask(todoId, request).subscribe({
      next: (subtask: SubTask) => {
        this.todos.update(todos =>
          todos.map(todo =>
            todo.id === todoId
              ? { ...todo, subtasks: [...todo.subtasks, subtask] }
              : todo
          )
        );
        this.notificationService.showSuccess(SUCCESS_MESSAGES.SUBTASK_ADDED);
      },
      error: (_err: Error) => {
        this.notificationService.showError(ERROR_MESSAGES.ADD_SUBTASK_FAILED);
      }
    });
  }

  onSubtaskUpdated(todoId: string, subtaskId: string, updates: Partial<SubTask>): void {
    this.todoService.updateSubTask(todoId, subtaskId, updates).subscribe({
      next: () => {
        this.todos.update(todos =>
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
      error: (_err: Error) => {
        this.notificationService.showError(ERROR_MESSAGES.UPDATE_SUBTASK_FAILED);
      }
    });
  }

  onSubtaskDeleted(todoId: string, subtaskId: string): void {
    this.todoService.deleteSubTask(todoId, subtaskId).subscribe({
      next: () => {
        this.todos.update(todos =>
          todos.map(todo =>
            todo.id === todoId
              ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
              : todo
          )
        );
        this.notificationService.showSuccess(SUCCESS_MESSAGES.SUBTASK_DELETED);
      },
      error: (_err: Error) => {
        this.notificationService.showError(ERROR_MESSAGES.DELETE_SUBTASK_FAILED);
      }
    });
  }

  onFilterChange(filterStatus: FilterStatus): void {
    this.filterStatus.set(filterStatus);
  }

  addNewTodoToList(newTodo: Todo): void {
    this.todos.update(todos => [...todos, newTodo]);
    this.notificationService.showSuccess(SUCCESS_MESSAGES.TODO_CREATED);
    this.isLoading.set(false);
  }

  // Test methods for debugging notifications
  testSuccess(): void {
    this.notificationService.showSuccess('This is a test success message!', 'Success Test');
  }

  testError(): void {
    this.notificationService.showError('This is a test error message!', 'Error Test');
  }

  async testConfirmation(): Promise<void> {
    await this.notificationService.showConfirmation(
      'Are you sure you want to test this confirmation?',
      'Confirmation Test'
    );
  }
}
