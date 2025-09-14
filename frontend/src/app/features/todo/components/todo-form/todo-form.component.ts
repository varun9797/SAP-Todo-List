import { Component, Signal } from '@angular/core';
import { TODO_STATUS } from '../../constants/todo.constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TodoStore } from '../../store/todo.store';


@Component({
  selector: 'app-todo-form',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss'
})
export class TodoFormComponent {
  todoForm: FormGroup;

  TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: 'Pending' },
    { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TODO_STATUS.COMPLETED, label: 'Completed' }
  ];

  constructor(
    private todoStore: TodoStore,
    private fb: FormBuilder
  ) {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: [TODO_STATUS.PENDING, Validators.required]
    });
  }

  get isLoading(): Signal<boolean> {
    return this.todoStore.loading;
  }

  async addTodo(): Promise<void> {
    if (this.todoForm.invalid) return;

    try {
      await this.todoStore.createTodo(this.todoForm.value);
      this.todoForm.reset({ status: TODO_STATUS.PENDING, description: '' });
    } catch (error) {
      // Handle error - keep form state for user to retry
      console.error('Failed to create todo:', error);
      // Re-throw for tests to catch
      throw error;
    }
  }
}
