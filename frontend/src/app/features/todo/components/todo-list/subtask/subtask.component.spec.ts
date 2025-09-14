import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubtaskComponent } from './subtask.component';
import { TodoStore } from '../../../store/todo.store';
import { SubTask } from '../../../models/todo.types';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

describe('SubtaskComponent', () => {
    let component: SubtaskComponent;
    let fixture: ComponentFixture<SubtaskComponent>;
    let mockTodoStore: {
        updateSubtask: jasmine.Spy;
        deleteSubtask: jasmine.Spy;
    };

    const mockSubtask: SubTask = {
        id: '1',
        title: 'Test Subtask',
        completed: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
    };

    beforeEach(async () => {
        mockTodoStore = {
            updateSubtask: jasmine.createSpy('updateSubtask').and.returnValue(Promise.resolve()),
            deleteSubtask: jasmine.createSpy('deleteSubtask').and.returnValue(Promise.resolve())
        };

        await TestBed.configureTestingModule({
            imports: [SubtaskComponent, ReactiveFormsModule, ButtonComponent],
            providers: [
                FormBuilder,
                { provide: TodoStore, useValue: mockTodoStore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SubtaskComponent);
        component = fixture.componentInstance;

        // Set required inputs
        component.subtask = mockSubtask;
        component.todoId = 'todo-1';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with correct signals', () => {
        expect(component.isEditing()).toBe(false);
        expect(component.isDeleting()).toBe(false);
        expect(component.isSaving()).toBe(false);
    });

    it('should have required inputs', () => {
        expect(component.subtask).toEqual(mockSubtask);
        expect(component.todoId).toBe('todo-1');
    });

    it('should initialize edit form', () => {
        expect(component.editForm).toBeDefined();
        expect(component.editForm.get('title')).toBeDefined();
    });

    describe('startEdit', () => {
        it('should set editing mode and populate form', () => {
            component.startEdit();

            expect(component.isEditing()).toBe(true);
            expect(component.editForm.get('title')?.value).toBe(mockSubtask.title);
        });
    });

    describe('cancelEdit', () => {
        it('should exit editing mode and reset form', () => {
            component.startEdit();
            component.editForm.patchValue({ title: 'Modified title' });

            component.cancelEdit();

            expect(component.isEditing()).toBe(false);
            expect(component.editForm.get('title')?.value).toBe(null);
        });
    });

    describe('saveSubtask', () => {
        it('should not save if form is invalid', () => {
            component.startEdit();
            component.editForm.patchValue({ title: '' }); // Invalid - required field

            component.saveSubtask();

            expect(mockTodoStore.updateSubtask).not.toHaveBeenCalled();
        });

        it('should save valid subtask', async () => {
            component.startEdit();
            component.editForm.patchValue({ title: 'Updated title' });

            component.saveSubtask();

            expect(component.isSaving()).toBe(true);
            expect(mockTodoStore.updateSubtask).toHaveBeenCalledWith(
                'todo-1',
                '1',
                { title: 'Updated title' }
            );
        });

        it('should handle save completion', async () => {
            component.startEdit();
            component.editForm.patchValue({ title: 'Updated title' });

            await component.saveSubtask();

            // Wait for promise resolution
            await fixture.whenStable();

            expect(component.isEditing()).toBe(false);
            expect(component.isSaving()).toBe(false);
        });

        it('should handle save error', async () => {
            mockTodoStore.updateSubtask.and.returnValue(Promise.reject('Error'));
            component.startEdit();
            component.editForm.patchValue({ title: 'Updated title' });

            component.saveSubtask();

            await fixture.whenStable();

            expect(component.isSaving()).toBe(false);
        });
    });

    describe('toggleCompletion', () => {
        it('should toggle subtask completion status', () => {
            component.toggleCompletion();

            expect(mockTodoStore.updateSubtask).toHaveBeenCalledWith(
                'todo-1',
                '1',
                { completed: true }
            );
        });

        it('should toggle to false if currently true', () => {
            component.subtask = { ...mockSubtask, completed: true };

            component.toggleCompletion();

            expect(mockTodoStore.updateSubtask).toHaveBeenCalledWith(
                'todo-1',
                '1',
                { completed: false }
            );
        });
    });

    describe('deleteSubtask', () => {
        it('should delete subtask', () => {
            component.deleteSubtask();

            expect(component.isDeleting()).toBe(true);
            expect(mockTodoStore.deleteSubtask).toHaveBeenCalledWith('todo-1', '1');
        });

        it('should handle delete completion', async () => {
            await component.deleteSubtask();

            await fixture.whenStable();

            expect(component.isDeleting()).toBe(false);
        });

        it('should handle delete error', async () => {
            mockTodoStore.deleteSubtask.and.returnValue(Promise.reject('Error'));

            component.deleteSubtask();

            await fixture.whenStable();

            expect(component.isDeleting()).toBe(false);
        });
    });

    describe('formatDate', () => {
        it('should format date object correctly', () => {
            const date = new Date('2025-01-01T10:30:00');
            const formatted = component.formatDate(date);

            expect(formatted).toContain('01/01/2025');
            expect(formatted).toContain('10:30');
        });

        it('should format date string correctly', () => {
            const dateString = '2025-01-01T10:30:00';
            const formatted = component.formatDate(dateString);

            expect(formatted).toContain('01/01/2025');
            expect(formatted).toContain('10:30');
        });

    });

    describe('Form Validation', () => {
        it('should require title field', () => {
            const titleControl = component.editForm.get('title');
            titleControl?.setValue('');

            expect(titleControl?.invalid).toBe(true);
            expect(titleControl?.errors?.['required']).toBe(true);
        });

        it('should be valid with title', () => {
            const titleControl = component.editForm.get('title');
            titleControl?.setValue('Valid title');

            expect(titleControl?.valid).toBe(true);
        });
    });
});
