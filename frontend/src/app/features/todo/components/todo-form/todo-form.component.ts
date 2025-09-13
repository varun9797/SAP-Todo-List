import { Component, signal } from '@angular/core';
import { TODO_STATUS } from '../../constants/todo.constants';
import { TodoService } from '../../services/todo.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';


@Component({
  selector: 'app-todo-form',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.scss'
})
export class TodoFormComponent {
  isLoading = signal(false);
  todoForm: FormGroup;

  TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: 'Pending' },
    { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TODO_STATUS.COMPLETED, label: 'Completed' }
  ];

  constructor(
    private todoService: TodoService,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) {
    this.todoForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: [TODO_STATUS.PENDING, Validators.required]
    });
  }

  addTodo() {
    if (this.todoForm.invalid) return;

    this.isLoading.set(true);

    this.todoService.createTodo(this.todoForm.value).subscribe({
      next: (newTodo) => {
        this.sharedService.triggerAddItemToList(newTodo);
        this.todoForm.reset({ status: TODO_STATUS.PENDING });
        this.isLoading.set(false);
      },
      error: (_err) => {
        this.sharedService.triggerErrorWhileAddingTodo(true);
        this.isLoading.set(false);
      }
    });
  }
}
