import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Todo, CreateSubTaskRequest } from '../../../models/todo.types';
import { TODO_STATUS, TODO_STATUS_LABELS } from '../../../constants/todo.constants';
import { SubtaskComponent } from '../subtask/subtask.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TodoStore } from '../../../store/todo.store';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SubtaskComponent, ButtonComponent],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;

  // Signals for component state
  isEditing = signal(false);
  showSubtaskForm = signal(false);

  TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: TODO_STATUS_LABELS[TODO_STATUS.PENDING] },
    { value: TODO_STATUS.IN_PROGRESS, label: TODO_STATUS_LABELS[TODO_STATUS.IN_PROGRESS] },
    { value: TODO_STATUS.COMPLETED, label: TODO_STATUS_LABELS[TODO_STATUS.COMPLETED] }
  ];

  // Reactive Forms
  editForm: FormGroup;
  subtaskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private todoStore: TodoStore
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });

    this.subtaskForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  startEdit(): void {
    this.editForm.patchValue({
      title: this.todo.title,
      description: this.todo.description,
      status: this.todo.status
    });
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.editForm.reset();
    this.isEditing.set(false);
  }

  saveTodo(): void {
    if (this.editForm.invalid) return;

    const formValue = this.editForm.value;
    const updatedTodo = { ...this.todo, ...formValue };
    this.todoStore.updateTodo(updatedTodo.id, formValue).then(() => {
      this.isEditing.set(false);
    });
  }

  deleteTodo(): void {
    this.todoStore.deleteTodo(this.todo.id);
  }

  toggleSubtaskForm(): void {
    this.showSubtaskForm.update(show => !show);
    if (!this.showSubtaskForm()) {
      this.subtaskForm.reset();
    }
  }

  addSubtask(): void {
    if (this.subtaskForm.invalid) return;

    const formValue = this.subtaskForm.value;
    const request: CreateSubTaskRequest = { title: formValue.title.trim() };

    this.todoStore.createSubtask(this.todo.id, request).then(() => {
      this.subtaskForm.reset();
      this.showSubtaskForm.set(false);
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case TODO_STATUS.PENDING: return TODO_STATUS_LABELS[TODO_STATUS.PENDING];
      case TODO_STATUS.IN_PROGRESS: return TODO_STATUS_LABELS[TODO_STATUS.IN_PROGRESS];
      case TODO_STATUS.COMPLETED: return TODO_STATUS_LABELS[TODO_STATUS.COMPLETED];
      default: return status;
    }
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
