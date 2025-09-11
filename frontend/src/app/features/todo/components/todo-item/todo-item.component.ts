import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Todo, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest } from '../../models/todo.types';
import { TodoService } from '../../services/todo.service';
import { TODO_STATUS, TODO_STATUS_LABELS } from '../../constants/todo.constants';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<string>();
  @Output() subtaskAdded = new EventEmitter<{ todoId: string; subtask: any }>();
  @Output() subtaskUpdated = new EventEmitter<{ todoId: string; subtaskId: string; updates: any }>();
  @Output() subtaskDeleted = new EventEmitter<{ todoId: string; subtaskId: string }>();

  // Signals for component state
  isEditing = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  showSubtaskForm = signal(false);
  isAddingSubtask = signal(false);
  editingSubtaskId = signal<string | null>(null);
  isSavingSubtask = signal(false);
  isDeletingSubtask = signal<string | null>(null);

  TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: TODO_STATUS_LABELS[TODO_STATUS.PENDING] },
    { value: TODO_STATUS.IN_PROGRESS, label: TODO_STATUS_LABELS[TODO_STATUS.IN_PROGRESS] },
    { value: TODO_STATUS.COMPLETED, label: TODO_STATUS_LABELS[TODO_STATUS.COMPLETED] }
  ];

  // Reactive Forms
  editForm: FormGroup;
  subtaskForm: FormGroup;
  editSubtaskForm: FormGroup;

  constructor(
    private todoService: TodoService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });

    this.subtaskForm = this.fb.group({
      title: ['', Validators.required]
    });

    this.editSubtaskForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  startEdit() {
    this.editForm.patchValue({
      title: this.todo.title,
      description: this.todo.description,
      status: this.todo.status
    });
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.editForm.reset();
    this.isEditing.set(false);
  }

  saveTodo() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.editForm.value;

    this.todoService.updateTodo(this.todo.id, formValue).subscribe({
      next: (updatedTodo: any) => {
        this.todoUpdated.emit(updatedTodo);
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: (err: any) => {
        console.error('Error updating todo:', err);
        this.isSaving.set(false);
      }
    });
  }

  deleteTodo() {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    this.isDeleting.set(true);
    this.todoService.deleteTodo(this.todo.id).subscribe({
      next: () => {
        this.todoDeleted.emit(this.todo.id);
        this.isDeleting.set(false);
      },
      error: (err: any) => {
        console.error('Error deleting todo:', err);
        this.isDeleting.set(false);
      }
    });
  }

  toggleSubtaskForm() {
    this.showSubtaskForm.update(show => !show);
    if (!this.showSubtaskForm()) {
      this.subtaskForm.reset();
    }
  }

  addSubtask() {
    if (this.subtaskForm.invalid) return;

    this.isAddingSubtask.set(true);
    const formValue = this.subtaskForm.value;
    const request: CreateSubTaskRequest = { title: formValue.title.trim() };

    this.todoService.createSubTask(this.todo.id, request).subscribe({
      next: (subtask: any) => {
        this.subtaskAdded.emit({ todoId: this.todo.id, subtask });
        this.subtaskForm.reset();
        this.showSubtaskForm.set(false);
        this.isAddingSubtask.set(false);
      },
      error: (err: any) => {
        console.error('Error adding subtask:', err);
        this.isAddingSubtask.set(false);
      }
    });
  }

  startSubtaskEdit(subtaskId: string, title: string) {
    this.editingSubtaskId.set(subtaskId);
    this.editSubtaskForm.patchValue({ title });
  }

  cancelSubtaskEdit() {
    this.editingSubtaskId.set(null);
    this.editSubtaskForm.reset();
  }

  saveSubtask(subtaskId: string) {
    if (this.editSubtaskForm.invalid) return;

    this.isSavingSubtask.set(true);
    const formValue = this.editSubtaskForm.value;
    const updates: UpdateSubTaskRequest = { title: formValue.title.trim() };

    this.todoService.updateSubTask(this.todo.id, subtaskId, updates).subscribe({
      next: () => {
        this.subtaskUpdated.emit({
          todoId: this.todo.id,
          subtaskId,
          updates: { title: formValue.title.trim() }
        });
        this.editingSubtaskId.set(null);
        this.editSubtaskForm.reset();
        this.isSavingSubtask.set(false);
      },
      error: (err: any) => {
        console.error('Error updating subtask:', err);
        this.isSavingSubtask.set(false);
      }
    });
  }

  toggleSubtaskCompletion(subtaskId: string, completed: boolean) {
    const updates: UpdateSubTaskRequest = { completed };

    this.todoService.updateSubTask(this.todo.id, subtaskId, updates).subscribe({
      next: () => {
        this.subtaskUpdated.emit({
          todoId: this.todo.id,
          subtaskId,
          updates: { completed }
        });
      },
      error: (err: any) => {
        console.error('Error updating subtask completion:', err);
      }
    });
  }

  deleteSubtask(subtaskId: string) {
    if (!confirm('Are you sure you want to delete this subtask?')) return;

    this.isDeletingSubtask.set(subtaskId);
    this.todoService.deleteSubTask(this.todo.id, subtaskId).subscribe({
      next: () => {
        this.subtaskDeleted.emit({ todoId: this.todo.id, subtaskId });
        this.isDeletingSubtask.set(null);
      },
      error: (err: any) => {
        console.error('Error deleting subtask:', err);
        this.isDeletingSubtask.set(null);
      }
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

  formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
