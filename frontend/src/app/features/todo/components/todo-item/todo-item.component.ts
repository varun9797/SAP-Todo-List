import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo, UpdateTodoRequest, CreateSubTaskRequest, UpdateSubTaskRequest } from '../../models/todo.types';
import { TodoService } from '../../services/todo.service';
import { TODO_STATUS, TODO_STATUS_LABELS } from '../../constants/todo.constants';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss'
})
export class TodoItemComponent {
  private readonly todoService = inject(TodoService);

  // Expose constants to template
  readonly TODO_STATUS = TODO_STATUS;
  readonly TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: TODO_STATUS_LABELS[TODO_STATUS.PENDING] },
    { value: TODO_STATUS.IN_PROGRESS, label: TODO_STATUS_LABELS[TODO_STATUS.IN_PROGRESS] },
    { value: TODO_STATUS.COMPLETED, label: TODO_STATUS_LABELS[TODO_STATUS.COMPLETED] }
  ];

  @Input({ required: true }) todo!: Todo;
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<string>();
  @Output() subtaskAdded = new EventEmitter<{ todoId: string; subtask: any }>();
  @Output() subtaskUpdated = new EventEmitter<{ todoId: string; subtaskId: string; updates: any }>();
  @Output() subtaskDeleted = new EventEmitter<{ todoId: string; subtaskId: string }>();

  // Signals for component state
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly showSubtaskForm = signal(false);
  readonly isAddingSubtask = signal(false);
  readonly editingSubtaskId = signal<string | null>(null);
  readonly isSavingSubtask = signal(false);
  readonly isDeletingSubtask = signal<string | null>(null);

  // Form data
  editForm: UpdateTodoRequest = {};
  newSubtaskTitle = '';
  editSubtaskTitle = '';

  startEdit() {
    this.editForm = {
      title: this.todo.title,
      description: this.todo.description,
      status: this.todo.status
    };
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.editForm = {};
    this.isEditing.set(false);
  }

  saveTodo() {
    if (!this.editForm.title?.trim()) return;

    this.isSaving.set(true);
    this.todoService.updateTodo(this.todo.id, this.editForm).subscribe({
      next: (updatedTodo) => {
        this.todoUpdated.emit(updatedTodo);
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: (err) => {
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
      error: (err) => {
        console.error('Error deleting todo:', err);
        this.isDeleting.set(false);
      }
    });
  }

  toggleSubtaskForm() {
    this.showSubtaskForm.update(show => !show);
    if (!this.showSubtaskForm()) {
      this.newSubtaskTitle = '';
    }
  }

  addSubtask() {
    if (!this.newSubtaskTitle.trim()) return;

    this.isAddingSubtask.set(true);
    const request: CreateSubTaskRequest = { title: this.newSubtaskTitle.trim() };

    this.todoService.createSubTask(this.todo.id, request).subscribe({
      next: (subtask) => {
        this.subtaskAdded.emit({ todoId: this.todo.id, subtask });
        this.newSubtaskTitle = '';
        this.showSubtaskForm.set(false);
        this.isAddingSubtask.set(false);
      },
      error: (err) => {
        console.error('Error adding subtask:', err);
        this.isAddingSubtask.set(false);
      }
    });
  }

  startSubtaskEdit(subtaskId: string, title: string) {
    this.editingSubtaskId.set(subtaskId);
    this.editSubtaskTitle = title;
  }

  cancelSubtaskEdit() {
    this.editingSubtaskId.set(null);
    this.editSubtaskTitle = '';
  }

  saveSubtask(subtaskId: string) {
    if (!this.editSubtaskTitle.trim()) return;

    this.isSavingSubtask.set(true);
    const updates: UpdateSubTaskRequest = { title: this.editSubtaskTitle.trim() };

    this.todoService.updateSubTask(this.todo.id, subtaskId, updates).subscribe({
      next: () => {
        this.subtaskUpdated.emit({ 
          todoId: this.todo.id, 
          subtaskId, 
          updates: { title: this.editSubtaskTitle.trim() }
        });
        this.editingSubtaskId.set(null);
        this.editSubtaskTitle = '';
        this.isSavingSubtask.set(false);
      },
      error: (err) => {
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
      error: (err) => {
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
      error: (err) => {
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
