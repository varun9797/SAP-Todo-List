import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, CreateTodoRequest } from '../../models/todo.types';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { 
  TODO_STATUS, 
  FilterStatus, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  DEFAULT_TODO,
  UI_TIMING
} from '../../constants/todo.constants';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  
  // Expose constants to template
  readonly TODO_STATUS = TODO_STATUS;
  readonly TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: 'Pending' },
    { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TODO_STATUS.COMPLETED, label: 'Completed' }
  ];
  readonly FILTER_OPTIONS = [
    { value: TODO_STATUS.ALL, label: 'All' },
    ...this.TODO_STATUS_OPTIONS
  ];
  
  // Signals
  readonly todos = signal<Todo[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  
  // Filter
  filterStatus: FilterStatus = TODO_STATUS.ALL;
  
  // Computed values
  readonly filteredTodos = computed(() => {
    const allTodos = this.todos();
    if (this.filterStatus === TODO_STATUS.ALL) {
      return allTodos;
    }
    return allTodos.filter(todo => todo.status === this.filterStatus);
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

  // Form data
  newTodo: CreateTodoRequest = {
    title: DEFAULT_TODO.title,
    description: DEFAULT_TODO.description,
    status: DEFAULT_TODO.status
  };

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.todoService.getAllTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(ERROR_MESSAGES.LOAD_TODOS_FAILED);
        this.isLoading.set(false);
        console.error('Error loading todos:', err);
      }
    });
  }

  addTodo() {
    if (!this.newTodo.title.trim()) return;
    
    this.isLoading.set(true);
    this.error.set(null);
    
    this.todoService.createTodo(this.newTodo).subscribe({
      next: (newTodo) => {
        this.todos.update(todos => [...todos, newTodo]);
        this.resetForm();
        this.successMessage.set(SUCCESS_MESSAGES.TODO_CREATED);
        this.isLoading.set(false);
        setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
      },
      error: (err) => {
        this.error.set(ERROR_MESSAGES.CREATE_TODO_FAILED);
        this.isLoading.set(false);
        console.error('Error creating todo:', err);
      }
    });
  }

  onTodoUpdated(updatedTodo: Todo) {
    this.todos.update(todos => 
      todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
    );
    this.successMessage.set(SUCCESS_MESSAGES.TODO_UPDATED);
    setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
  }

  onTodoDeleted(todoId: string) {
    this.todos.update(todos => todos.filter(todo => todo.id !== todoId));
    this.successMessage.set(SUCCESS_MESSAGES.TODO_DELETED);
    setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
  }

  onSubtaskAdded(todoId: string, subtask: any) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === todoId
          ? { ...todo, subtasks: [...todo.subtasks, subtask] }
          : todo
      )
    );
    this.successMessage.set(SUCCESS_MESSAGES.SUBTASK_ADDED);
    setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
  }

  onSubtaskUpdated(todoId: string, subtaskId: string, updates: any) {
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
    this.successMessage.set(SUCCESS_MESSAGES.SUBTASK_UPDATED);
    setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
  }

  onSubtaskDeleted(todoId: string, subtaskId: string) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === todoId
          ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
          : todo
      )
    );
    this.successMessage.set(SUCCESS_MESSAGES.SUBTASK_DELETED);
    setTimeout(() => this.clearSuccess(), UI_TIMING.SUCCESS_MESSAGE_TIMEOUT);
  }

  onFilterChange() {
    // Filter is automatically updated via computed signal
  }

  resetForm() {
    this.newTodo = {
      title: DEFAULT_TODO.title,
      description: DEFAULT_TODO.description,
      status: DEFAULT_TODO.status
    };
  }

  clearError() {
    this.error.set(null);
  }

  clearSuccess() {
    this.successMessage.set(null);
  }
}
