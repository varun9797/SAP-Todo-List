import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TodoItemComponent } from './todo-item.component';
import { TodoStore } from '../../../store/todo.store';
import { Todo, CreateSubTaskRequest } from '../../../models/todo.types';
import { TODO_STATUS } from '../../../constants/todo.constants';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { SubtaskComponent } from '../subtask/subtask.component';

describe('TodoItemComponent', () => {
    let component: TodoItemComponent;
    let fixture: ComponentFixture<TodoItemComponent>;
    let mockTodoStore: jasmine.SpyObj<TodoStore>;

    const mockTodo: Todo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        status: TODO_STATUS.PENDING,
        subtasks: [],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z')
    };

    beforeEach(async () => {
        mockTodoStore = jasmine.createSpyObj('TodoStore', [
            'updateTodo',
            'deleteTodo',
            'createSubtask'
        ]);

        await TestBed.configureTestingModule({
            imports: [TodoItemComponent, ReactiveFormsModule, ButtonComponent, SubtaskComponent],
            providers: [
                { provide: TodoStore, useValue: mockTodoStore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TodoItemComponent);
        component = fixture.componentInstance;
        
        // Set required input
        fixture.componentRef.setInput('todo', mockTodo);
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with editing disabled', () => {
            expect(component.isEditing()).toBe(false);
        });

        it('should initialize with subtask form hidden', () => {
            expect(component.showSubtaskForm()).toBe(false);
        });

        it('should initialize forms', () => {
            expect(component.editForm).toBeDefined();
            expect(component.subtaskForm).toBeDefined();
        });
    });

    describe('Edit Functionality', () => {
        it('should start edit mode and populate form', () => {
            component.startEdit();

            expect(component.isEditing()).toBe(true);
            expect(component.editForm.value).toEqual({
                title: mockTodo.title,
                description: mockTodo.description,
                status: mockTodo.status
            });
        });

        it('should cancel edit mode and reset form', () => {
            component.startEdit();
            component.editForm.patchValue({ title: 'Modified' });
            
            component.cancelEdit();

            expect(component.isEditing()).toBe(false);
            expect(component.editForm.get('title')?.value).toBeNull();
        });

        it('should save todo when form is valid', async () => {
            mockTodoStore.updateTodo.and.returnValue(Promise.resolve());
            
            component.startEdit();
            component.editForm.patchValue({
                title: 'Updated Title',
                description: 'Updated Description',
                status: TODO_STATUS.IN_PROGRESS
            });

            await component.saveTodo();

            expect(mockTodoStore.updateTodo).toHaveBeenCalledWith('1', {
                title: 'Updated Title',
                description: 'Updated Description',
                status: TODO_STATUS.IN_PROGRESS
            });
            expect(component.isEditing()).toBe(false);
        });

        it('should not save todo when form is invalid', async () => {
            component.startEdit();
            component.editForm.patchValue({
                title: '', // Required field
                description: 'Description',
                status: TODO_STATUS.PENDING
            });

            await component.saveTodo();

            expect(mockTodoStore.updateTodo).not.toHaveBeenCalled();
            expect(component.isEditing()).toBe(true);
        });
    });

    describe('Delete Functionality', () => {
        it('should call TodoStore.deleteTodo', async () => {
            mockTodoStore.deleteTodo.and.returnValue(Promise.resolve());

            await component.deleteTodo();

            expect(mockTodoStore.deleteTodo).toHaveBeenCalledWith('1');
        });
    });

    describe('Subtask Functionality', () => {
        it('should toggle subtask form visibility', () => {
            expect(component.showSubtaskForm()).toBe(false);

            component.toggleSubtaskForm();
            expect(component.showSubtaskForm()).toBe(true);

            component.toggleSubtaskForm();
            expect(component.showSubtaskForm()).toBe(false);
        });

        it('should reset subtask form when hiding', () => {
            component.toggleSubtaskForm(); // Show form
            component.subtaskForm.patchValue({ title: 'Test subtask' });
            
            component.toggleSubtaskForm(); // Hide form

            expect(component.subtaskForm.get('title')?.value).toBeNull();
        });

        it('should add subtask when form is valid', async () => {
            mockTodoStore.createSubtask.and.returnValue(Promise.resolve());
            
            component.subtaskForm.patchValue({ title: 'New Subtask' });

            await component.addSubtask();

            const expectedRequest: CreateSubTaskRequest = { title: 'New Subtask' };
            expect(mockTodoStore.createSubtask).toHaveBeenCalledWith('1', expectedRequest);
            expect(component.subtaskForm.get('title')?.value).toBeNull();
            expect(component.showSubtaskForm()).toBe(false);
        });

        it('should not add subtask when form is invalid', async () => {
            component.subtaskForm.patchValue({ title: '' }); // Required field

            await component.addSubtask();

            expect(mockTodoStore.createSubtask).not.toHaveBeenCalled();
        });

        it('should trim whitespace from subtask title', async () => {
            mockTodoStore.createSubtask.and.returnValue(Promise.resolve());
            
            component.subtaskForm.patchValue({ title: '  Spaced Title  ' });

            await component.addSubtask();

            const expectedRequest: CreateSubTaskRequest = { title: 'Spaced Title' };
            expect(mockTodoStore.createSubtask).toHaveBeenCalledWith('1', expectedRequest);
        });
    });

    describe('Utility Methods', () => {
        it('should return correct status label for pending', () => {
            const label = component.getStatusLabel(TODO_STATUS.PENDING);
            expect(label).toBe('Pending');
        });

        it('should return correct status label for in progress', () => {
            const label = component.getStatusLabel(TODO_STATUS.IN_PROGRESS);
            expect(label).toBe('In Progress');
        });

        it('should return correct status label for completed', () => {
            const label = component.getStatusLabel(TODO_STATUS.COMPLETED);
            expect(label).toBe('Completed');
        });

        it('should return input status for unknown status', () => {
            const label = component.getStatusLabel('unknown');
            expect(label).toBe('unknown');
        });

        it('should format date correctly', () => {
            const testDate = new Date('2023-01-15T14:30:00Z');
            const formatted = component.formatDate(testDate);
            
            expect(formatted).toContain('15/01/2023');
            expect(formatted).toContain('14:30');
        });

        it('should format string date correctly', () => {
            const dateString = '2023-01-15T14:30:00Z';
            const formatted = component.formatDate(dateString);
            
            expect(formatted).toContain('15/01/2023');
            expect(formatted).toContain('14:30');
        });
    });

    describe('TODO_STATUS_OPTIONS', () => {
        it('should have correct status options', () => {
            expect(component.TODO_STATUS_OPTIONS).toEqual([
                { value: TODO_STATUS.PENDING, label: 'Pending' },
                { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
                { value: TODO_STATUS.COMPLETED, label: 'Completed' }
            ]);
        });
    });

    describe('Form Validation', () => {
        it('should validate edit form title as required', () => {
            const titleControl = component.editForm.get('title');
            titleControl?.setValue('');
            expect(titleControl?.hasError('required')).toBe(true);
        });

        it('should validate edit form status as required', () => {
            const statusControl = component.editForm.get('status');
            statusControl?.setValue('');
            expect(statusControl?.hasError('required')).toBe(true);
        });

        it('should validate subtask form title as required', () => {
            const titleControl = component.subtaskForm.get('title');
            titleControl?.setValue('');
            expect(titleControl?.hasError('required')).toBe(true);
        });
    });

    describe('Integration with Todo Data', () => {
        it('should display todo information correctly', () => {
            expect(component.todo.title).toBe('Test Todo');
            expect(component.todo.description).toBe('Test Description');
            expect(component.todo.status).toBe(TODO_STATUS.PENDING);
        });

        it('should handle todo with subtasks', () => {
            const todoWithSubtasks: Todo = {
                ...mockTodo,
                subtasks: [
                    {
                        id: '1',
                        title: 'Subtask 1',
                        completed: false,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ]
            };

            fixture.componentRef.setInput('todo', todoWithSubtasks);
            fixture.detectChanges();

            expect(component.todo.subtasks.length).toBe(1);
            expect(component.todo.subtasks[0].title).toBe('Subtask 1');
        });
    });
});
