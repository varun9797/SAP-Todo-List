import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CreateTodoRequest, Todo } from '../../models/todo.types';
import { DEFAULT_TODO, ERROR_MESSAGES, SUCCESS_MESSAGES, TODO_STATUS, UI_TIMING } from '../../constants/todo.constants';
import { TodoService } from '../../services/todo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';


@Component({
  selector: 'app-todo-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss'
})
export class TodoFormComponent {

  // Signals
  // readonly todos = signal<Todo[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: 'Pending' },
    { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TODO_STATUS.COMPLETED, label: 'Completed' }
  ];
  // Form data
  newTodo: CreateTodoRequest = {
    title: DEFAULT_TODO.title,
    description: DEFAULT_TODO.description,
    status: DEFAULT_TODO.status
  };

  constructor(private readonly todoService: TodoService, private sharedService: SharedService) { }

  addTodo() {
    if (!this.newTodo.title.trim()) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.todoService.createTodo(this.newTodo).subscribe({
      next: (newTodo) => {
        // this.todos.update(todos => [...todos, newTodo]);
        // this.updateList.emit(newTodo);
        this.sharedService.triggerAddItemToList(newTodo);
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

  resetForm() {
    this.newTodo = {
      title: DEFAULT_TODO.title,
      description: DEFAULT_TODO.description,
      status: DEFAULT_TODO.status
    };
  }

  clearSuccess() {
    this.successMessage.set(null);
  }
}
