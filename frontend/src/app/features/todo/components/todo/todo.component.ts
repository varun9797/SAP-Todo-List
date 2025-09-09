import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo, UpdateTodoRequest } from '../../models/todo.types';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<string>();

  // Signals for component state
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);

  // Form data
  editForm: UpdateTodoRequest = {};

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
    // Emit the update request to parent component
    this.todoUpdated.emit({
      ...this.todo,
      ...this.editForm,
      updatedAt: new Date()
    } as Todo);
    
    this.isEditing.set(false);
    this.isSaving.set(false);
  }

  deleteTodo() {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    this.isDeleting.set(true);
    this.todoDeleted.emit(this.todo.id);
  }

  toggleStatus() {
    const newStatus = this.todo.status === 'completed' ? 'pending' : 'completed';
    this.todoUpdated.emit({
      ...this.todo,
      status: newStatus,
      updatedAt: new Date()
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
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
