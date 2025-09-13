import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Todo, CreateSubTaskRequest, SubTask } from '../../../models/todo.types';
import { TODO_STATUS, TODO_STATUS_LABELS } from '../../../constants/todo.constants';
import { SubtaskComponent } from '../subtask/subtask.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SubtaskComponent, ButtonComponent],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<string>();
  @Output() subtaskAdded = new EventEmitter<{ todoId: string; subtask: CreateSubTaskRequest }>();
  @Output() subtaskUpdated = new EventEmitter<{ todoId: string; subtaskId: string; updates: Partial<SubTask> }>();
  @Output() subtaskDeleted = new EventEmitter<{ todoId: string; subtaskId: string }>();

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

  constructor(private fb: FormBuilder) {
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
    this.todoUpdated.emit(updatedTodo);
    this.isEditing.set(false);
  }

  deleteTodo(): void {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    this.todoDeleted.emit(this.todo.id);
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

    // Emit the request, parent component will handle API call and return the created subtask
    this.subtaskAdded.emit({ todoId: this.todo.id, subtask: request });
    this.subtaskForm.reset();
    this.showSubtaskForm.set(false);
  }

  onSubtaskUpdated(event: { todoId: string; subtaskId: string; updates: Partial<SubTask> }): void {
    this.subtaskUpdated.emit(event);
  }

  onSubtaskDeleted(event: { todoId: string; subtaskId: string }): void {
    this.subtaskDeleted.emit(event);
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
