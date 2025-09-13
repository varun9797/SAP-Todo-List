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

  addTodo(): void {
    if (this.todoForm.invalid) return;

    this.todoStore.createTodo(this.todoForm.value).then(() => {
      this.todoForm.reset({ status: TODO_STATUS.PENDING, description: '' });
    });
  }
}
