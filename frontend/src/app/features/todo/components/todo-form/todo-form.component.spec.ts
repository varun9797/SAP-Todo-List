import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TodoFormComponent } from './todo-form.component';
import { TodoStore } from '../../store/todo.store';
import { TODO_STATUS } from '../../constants/todo.constants';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

describe('TodoFormComponent', () => {
    let component: TodoFormComponent;
    let fixture: ComponentFixture<TodoFormComponent>;
    let mockTodoStore: jasmine.SpyObj<TodoStore>;

    beforeEach(async () => {
        mockTodoStore = jasmine.createSpyObj('TodoStore', ['createTodo'], {
            loading: jasmine.createSpy().and.returnValue(false)
        });

        await TestBed.configureTestingModule({
            imports: [TodoFormComponent, ReactiveFormsModule, ButtonComponent],
            providers: [
                { provide: TodoStore, useValue: mockTodoStore }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TodoFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize form with default values', () => {
            expect(component.todoForm.get('title')?.value).toBe('');
            expect(component.todoForm.get('description')?.value).toBe('');
            expect(component.todoForm.get('status')?.value).toBe(TODO_STATUS.PENDING);
        });

        it('should have required validator on title field', () => {
            const titleControl = component.todoForm.get('title');
            titleControl?.setValue('');
            expect(titleControl?.hasError('required')).toBe(true);
        });

        it('should have required validator on status field', () => {
            const statusControl = component.todoForm.get('status');
            statusControl?.setValue('');
            expect(statusControl?.hasError('required')).toBe(true);
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

    describe('isLoading getter', () => {
        it('should return loading state from TodoStore', () => {
            Object.defineProperty(mockTodoStore, 'loading', {
                value: jasmine.createSpy().and.returnValue(true)
            });
            
            expect(component.isLoading()).toBe(true);
        });
    });

    describe('addTodo method', () => {
        beforeEach(() => {
            component.todoForm.patchValue({
                title: 'Test Todo',
                description: 'Test Description',
                status: TODO_STATUS.PENDING
            });
        });

        it('should call TodoStore.createTodo with form values when form is valid', async () => {
            mockTodoStore.createTodo.and.returnValue(Promise.resolve());

            await component.addTodo();

            expect(mockTodoStore.createTodo).toHaveBeenCalledWith({
                title: 'Test Todo',
                description: 'Test Description',
                status: TODO_STATUS.PENDING
            });
        });

        it('should reset form after successful creation', async () => {
            mockTodoStore.createTodo.and.returnValue(Promise.resolve());

            await component.addTodo();

            expect(component.todoForm.get('title')?.value).toBe(null);
            expect(component.todoForm.get('description')?.value).toBe(null);
            expect(component.todoForm.get('status')?.value).toBe(TODO_STATUS.PENDING);
        });

        it('should not call TodoStore.createTodo when form is invalid', async () => {
            component.todoForm.patchValue({
                title: '', // Invalid - required field
                description: 'Test Description',
                status: TODO_STATUS.PENDING
            });

            await component.addTodo();

            expect(mockTodoStore.createTodo).not.toHaveBeenCalled();
        });

        it('should not reset form when creation fails', async () => {
            mockTodoStore.createTodo.and.returnValue(Promise.reject(new Error('Creation failed')));

            try {
                await component.addTodo();
            } catch (_error) {
                // Expected to fail
            }

            expect(component.todoForm.get('title')?.value).toBe('Test Todo');
        });
    });

    describe('Form Validation', () => {
        it('should mark title as invalid when empty', () => {
            const titleControl = component.todoForm.get('title');
            titleControl?.setValue('');
            titleControl?.markAsTouched();

            expect(titleControl?.invalid).toBe(true);
            expect(titleControl?.hasError('required')).toBe(true);
        });

        it('should mark title as valid when not empty', () => {
            const titleControl = component.todoForm.get('title');
            titleControl?.setValue('Valid Title');

            expect(titleControl?.valid).toBe(true);
        });

        it('should mark status as invalid when empty', () => {
            const statusControl = component.todoForm.get('status');
            statusControl?.setValue('');
            statusControl?.markAsTouched();

            expect(statusControl?.invalid).toBe(true);
            expect(statusControl?.hasError('required')).toBe(true);
        });

        it('should mark form as invalid when required fields are empty', () => {
            component.todoForm.patchValue({
                title: '',
                description: 'Optional description',
                status: ''
            });

            expect(component.todoForm.invalid).toBe(true);
        });

        it('should mark form as valid when required fields are filled', () => {
            component.todoForm.patchValue({
                title: 'Valid Title',
                description: 'Optional description',
                status: TODO_STATUS.PENDING
            });

            expect(component.todoForm.valid).toBe(true);
        });
    });

    describe('Form Values', () => {
        it('should update form values correctly', () => {
            const testValues = {
                title: 'New Todo Item',
                description: 'This is a test description',
                status: TODO_STATUS.IN_PROGRESS
            };

            component.todoForm.patchValue(testValues);

            expect(component.todoForm.value).toEqual(testValues);
        });

        it('should handle empty description', () => {
            component.todoForm.patchValue({
                title: 'Todo without description',
                description: '',
                status: TODO_STATUS.PENDING
            });

            expect(component.todoForm.get('description')?.value).toBe('');
            expect(component.todoForm.valid).toBe(true);
        });
    });

    describe('Integration', () => {
        it('should create todo when form is submitted with valid data', async () => {
            mockTodoStore.createTodo.and.returnValue(Promise.resolve());
            
            // Fill form
            component.todoForm.patchValue({
                title: 'Integration Test Todo',
                description: 'Test description',
                status: TODO_STATUS.PENDING
            });

            // Submit form
            await component.addTodo();

            // Verify store was called
            expect(mockTodoStore.createTodo).toHaveBeenCalledWith({
                title: 'Integration Test Todo',
                description: 'Test description',
                status: TODO_STATUS.PENDING
            });

            // Verify form was reset
            expect(component.todoForm.get('title')?.value).toBe(null);
        });
    });
});
