import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SubTask } from '../../../models/todo.types';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TodoStore } from '../../../store/todo.store';

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

    // Signals for component state
    isEditing = signal(false);
    isDeleting = signal(false);
    isSaving = signal(false);

    // Reactive Form
    editForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private todoStore: TodoStore
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

        this.todoStore.updateSubtask(this.todoId, this.subtask.id, updates).then(() => {
            this.isEditing.set(false);
            this.editForm.reset();
            this.isSaving.set(false);
        }).catch(() => {
            this.isSaving.set(false);
        });
    }

    toggleCompletion(): void {
        const updates: Partial<SubTask> = { completed: !this.subtask.completed };
        this.todoStore.updateSubtask(this.todoId, this.subtask.id, updates);
    }

    deleteSubtask(): void {
        this.isDeleting.set(true);
        this.todoStore.deleteSubtask(this.todoId, this.subtask.id).then(() => {
            this.isDeleting.set(false);
        }).catch(() => {
            this.isDeleting.set(false);
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
