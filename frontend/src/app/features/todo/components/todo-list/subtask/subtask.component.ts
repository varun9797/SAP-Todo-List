import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SubTask } from '../../../models/todo.types';
import { TodoService } from '../../../services/todo.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
    selector: 'app-subtask',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
    templateUrl: './subtask.component.html',
    styleUrl: './subtask.component.scss'
})
export class SubtaskComponent {
    @Input({ required: true }) subtask!: SubTask;
    @Input({ required: true }) todoId!: string;
    @Output() subtaskUpdated = new EventEmitter<{ todoId: string; subtaskId: string; updates: Partial<SubTask> }>();
    @Output() subtaskDeleted = new EventEmitter<{ todoId: string; subtaskId: string }>();

    // Signals for component state
    isEditing = signal(false);
    isSaving = signal(false);
    isDeleting = signal(false);

    // Reactive Form
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private todoService: TodoService
    ) {
        this.editForm = this.fb.group({
            title: ['', Validators.required]
        });
    }

    startEdit(): void {
        this.editForm.patchValue({ title: this.subtask.title });
        this.isEditing.set(true);
    }

    cancelEdit(): void {
        this.editForm.reset();
        this.isEditing.set(false);
    }

    saveSubtask(): void {
        if (this.editForm.invalid) return;

        this.isSaving.set(true);
        const formValue = this.editForm.value;
        const updates: Partial<SubTask> = { title: formValue.title.trim() };

        this.todoService.updateSubTask(this.todoId, this.subtask.id, updates).subscribe({
            next: () => {
                this.subtaskUpdated.emit({
                    todoId: this.todoId,
                    subtaskId: this.subtask.id,
                    updates
                });
                this.isEditing.set(false);
                this.isSaving.set(false);
                this.editForm.reset();
            },
            error: (_err: Error) => {
                this.isSaving.set(false);
            }
        });
    }

    toggleCompletion(): void {
        const updates: Partial<SubTask> = { completed: !this.subtask.completed };

        this.todoService.updateSubTask(this.todoId, this.subtask.id, updates).subscribe({
            next: () => {
                this.subtaskUpdated.emit({
                    todoId: this.todoId,
                    subtaskId: this.subtask.id,
                    updates
                });
            },
            error: (_err: Error) => {
                // Error handling could be added here if needed
            }
        });
    }

    deleteSubtask(): void {
        if (!confirm('Are you sure you want to delete this subtask?')) return;

        this.isDeleting.set(true);
        this.todoService.deleteSubTask(this.todoId, this.subtask.id).subscribe({
            next: () => {
                this.subtaskDeleted.emit({
                    todoId: this.todoId,
                    subtaskId: this.subtask.id
                });
            },
            error: (_err: Error) => {
                this.isDeleting.set(false);
            }
        });
    }

    formatDate(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
