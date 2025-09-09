import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, CreateTodoRequest } from '../../models/todo.types';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);
  
  // Signals
  readonly todos = signal<Todo[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  
  // Filter
  filterStatus: 'all' | 'pending' | 'in-progress' | 'completed' = 'all';
  
  // Computed values
  readonly filteredTodos = computed(() => {
    const allTodos = this.todos();
    if (this.filterStatus === 'all') {
      return allTodos;
    }
    return allTodos.filter(todo => todo.status === this.filterStatus);
  });
  
  readonly pendingCount = computed(() => 
    this.todos().filter(todo => todo.status === 'pending').length
  );
  
  readonly inProgressCount = computed(() => 
    this.todos().filter(todo => todo.status === 'in-progress').length
  );
  
  readonly completedCount = computed(() => 
    this.todos().filter(todo => todo.status === 'completed').length
  );

  // Form data
  newTodo: CreateTodoRequest = {
    title: '',
    description: '',
    status: 'pending'
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
        this.error.set('Failed to load todos. Please try again.');
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
        this.successMessage.set('Todo created successfully!');
        this.isLoading.set(false);
        setTimeout(() => this.clearSuccess(), 3000);
      },
      error: (err) => {
        this.error.set('Failed to create todo. Please try again.');
        this.isLoading.set(false);
        console.error('Error creating todo:', err);
      }
    });
  }

  onTodoUpdated(updatedTodo: Todo) {
    this.todos.update(todos => 
      todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
    );
    this.successMessage.set('Todo updated successfully!');
    setTimeout(() => this.clearSuccess(), 3000);
  }

  onTodoDeleted(todoId: string) {
    this.todos.update(todos => todos.filter(todo => todo.id !== todoId));
    this.successMessage.set('Todo deleted successfully!');
    setTimeout(() => this.clearSuccess(), 3000);
  }

  onSubtaskAdded(todoId: string, subtask: any) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === todoId
          ? { ...todo, subtasks: [...todo.subtasks, subtask] }
          : todo
      )
    );
    this.successMessage.set('Subtask added successfully!');
    setTimeout(() => this.clearSuccess(), 3000);
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
    this.successMessage.set('Subtask updated successfully!');
    setTimeout(() => this.clearSuccess(), 3000);
  }

  onSubtaskDeleted(todoId: string, subtaskId: string) {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === todoId
          ? { ...todo, subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId) }
          : todo
      )
    );
    this.successMessage.set('Subtask deleted successfully!');
    setTimeout(() => this.clearSuccess(), 3000);
  }

  onFilterChange() {
    // Filter is automatically updated via computed signal
  }

  resetForm() {
    this.newTodo = {
      title: '',
      description: '',
      status: 'pending'
    };
  }

  clearError() {
    this.error.set(null);
  }

  clearSuccess() {
    this.successMessage.set(null);
  }
}
