import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoStore } from './todo.store';
import { TodoService } from '../services/todo.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Todo, SubTask, CreateTodoRequest, UpdateTodoRequest, CreateSubTaskRequest } from '../models/todo.types';
import { TODO_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/todo.constants';

describe('TodoStore', () => {
    let store: TodoStore;
    let todoService: jasmine.SpyObj<TodoService>;
    let notificationService: jasmine.SpyObj<NotificationService>;

    const mockTodo: Todo = {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        status: TODO_STATUS.PENDING,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockSubtask: SubTask = {
        id: '1',
        title: 'Test Subtask',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        const todoServiceSpy = jasmine.createSpyObj('TodoService', [
            'getAllTodos',
            'createTodo',
            'updateTodo',
            'deleteTodo',
            'createSubTask',
            'updateSubTask',
            'deleteSubTask'
        ]);

        const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
            'showSuccess',
            'showError',
            'showConfirmation'
        ]);

        TestBed.configureTestingModule({
            providers: [
                TodoStore,
                { provide: TodoService, useValue: todoServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy }
            ]
        });

        store = TestBed.inject(TodoStore);
        todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
        notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    });

    describe('Initial State', () => {
        it('should have empty todos array initially', () => {
            expect(store.todos()).toEqual([]);
        });

        it('should not be loading initially', () => {
            expect(store.loading()).toBe(false);
        });

        it('should have filter set to ALL initially', () => {
            expect(store.filter()).toBe(TODO_STATUS.ALL);
        });

        it('should have zero counts initially', () => {
            const counts = store.counts();
            expect(counts.pending).toBe(0);
            expect(counts.inProgress).toBe(0);
            expect(counts.completed).toBe(0);
            expect(counts.total).toBe(0);
        });
    });

    describe('loadTodos', () => {
        it('should load todos successfully', async () => {
            const mockTodos = [mockTodo];
            todoService.getAllTodos.and.returnValue(of(mockTodos));

            await store.loadTodos();

            expect(store.todos()).toEqual(mockTodos);
            expect(store.loading()).toBe(false);
            expect(todoService.getAllTodos).toHaveBeenCalled();
        });

        it('should handle load todos error', async () => {
            todoService.getAllTodos.and.returnValue(throwError(() => new Error('Load failed')));

            await store.loadTodos();

            expect(store.todos()).toEqual([]);
            expect(store.loading()).toBe(false);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.LOAD_TODOS_FAILED);
        });
    });

    describe('createTodo', () => {
        it('should create todo successfully', async () => {
            const request: CreateTodoRequest = { 
                title: 'New Todo', 
                description: 'Description',
                status: TODO_STATUS.PENDING
            };
            todoService.createTodo.and.returnValue(of(mockTodo));

            await store.createTodo(request);

            expect(store.todos()).toContain(mockTodo);
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.TODO_CREATED);
            expect(todoService.createTodo).toHaveBeenCalledWith(request);
        });

        it('should handle create todo error', async () => {
            const request: CreateTodoRequest = { 
                title: 'New Todo', 
                description: 'Description',
                status: TODO_STATUS.PENDING
            };
            todoService.createTodo.and.returnValue(throwError(() => new Error('Create failed')));

            await store.createTodo(request);

            expect(store.todos()).toEqual([]);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.CREATE_TODO_FAILED);
        });
    });

    describe('updateTodo', () => {
        beforeEach(async () => {
            todoService.getAllTodos.and.returnValue(of([mockTodo]));
            await store.loadTodos();
        });

        it('should update todo successfully', async () => {
            const updates: UpdateTodoRequest = { title: 'Updated Title' };
            const updatedTodo = { ...mockTodo, title: 'Updated Title' };
            todoService.updateTodo.and.returnValue(of(updatedTodo));

            await store.updateTodo(mockTodo.id, updates);

            expect(store.todos()[0].title).toBe('Updated Title');
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.TODO_UPDATED);
        });

        it('should handle update todo error', async () => {
            const updates: UpdateTodoRequest = { title: 'Updated Title' };
            todoService.updateTodo.and.returnValue(throwError(() => new Error('Update failed')));

            await store.updateTodo(mockTodo.id, updates);

            expect(store.todos()[0].title).toBe(mockTodo.title);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.UPDATE_TODO_FAILED);
        });
    });

    describe('deleteTodo', () => {
        beforeEach(async () => {
            todoService.getAllTodos.and.returnValue(of([mockTodo]));
            await store.loadTodos();
        });

        it('should delete todo after confirmation', async () => {
            notificationService.showConfirmation.and.returnValue(Promise.resolve(true));
            todoService.deleteTodo.and.returnValue(of(undefined));

            await store.deleteTodo(mockTodo.id);

            expect(store.todos()).toEqual([]);
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.TODO_DELETED);
        });

        it('should not delete todo if not confirmed', async () => {
            notificationService.showConfirmation.and.returnValue(Promise.resolve(false));

            await store.deleteTodo(mockTodo.id);

            expect(store.todos()).toEqual([mockTodo]);
            expect(todoService.deleteTodo).not.toHaveBeenCalled();
        });

        it('should handle delete todo error', async () => {
            notificationService.showConfirmation.and.returnValue(Promise.resolve(true));
            todoService.deleteTodo.and.returnValue(throwError(() => new Error('Delete failed')));

            await store.deleteTodo(mockTodo.id);

            expect(store.todos()).toEqual([mockTodo]);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.DELETE_TODO_FAILED);
        });
    });

    describe('createSubtask', () => {
        beforeEach(async () => {
            todoService.getAllTodos.and.returnValue(of([mockTodo]));
            await store.loadTodos();
        });

        it('should create subtask successfully', async () => {
            const request: CreateSubTaskRequest = { title: 'New Subtask' };
            todoService.createSubTask.and.returnValue(of(mockSubtask));

            await store.createSubtask(mockTodo.id, request);

            expect(store.todos()[0].subtasks).toContain(mockSubtask);
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.SUBTASK_ADDED);
        });

        it('should handle create subtask error', async () => {
            const request: CreateSubTaskRequest = { title: 'New Subtask' };
            todoService.createSubTask.and.returnValue(throwError(() => new Error('Create failed')));

            await store.createSubtask(mockTodo.id, request);

            expect(store.todos()[0].subtasks).toEqual([]);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.ADD_SUBTASK_FAILED);
        });
    });

    describe('updateSubtask', () => {
        beforeEach(async () => {
            const todoWithSubtask = { ...mockTodo, subtasks: [mockSubtask] };
            todoService.getAllTodos.and.returnValue(of([todoWithSubtask]));
            await store.loadTodos();
        });

        it('should update subtask successfully', async () => {
            const updates = { title: 'Updated Subtask' };
            const updatedSubtask = { ...mockSubtask, title: 'Updated Subtask' };
            todoService.updateSubTask.and.returnValue(of(updatedSubtask));

            await store.updateSubtask(mockTodo.id, mockSubtask.id, updates);

            expect(store.todos()[0].subtasks[0].title).toBe('Updated Subtask');
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.SUBTASK_UPDATED);
        });

        it('should handle update subtask error', async () => {
            const updates = { title: 'Updated Subtask' };
            todoService.updateSubTask.and.returnValue(throwError(() => new Error('Update failed')));

            await store.updateSubtask(mockTodo.id, mockSubtask.id, updates);

            expect(store.todos()[0].subtasks[0].title).toBe(mockSubtask.title);
            expect(notificationService.showError).toHaveBeenCalledWith(ERROR_MESSAGES.UPDATE_SUBTASK_FAILED);
        });
    });

    describe('deleteSubtask', () => {
        beforeEach(async () => {
            const todoWithSubtask = { ...mockTodo, subtasks: [mockSubtask] };
            todoService.getAllTodos.and.returnValue(of([todoWithSubtask]));
            await store.loadTodos();
        });

        it('should delete subtask after confirmation', async () => {
            notificationService.showConfirmation.and.returnValue(Promise.resolve(true));
            todoService.deleteSubTask.and.returnValue(of(undefined));

            await store.deleteSubtask(mockTodo.id, mockSubtask.id);

            expect(store.todos()[0].subtasks).toEqual([]);
            expect(notificationService.showSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGES.SUBTASK_DELETED);
        });

        it('should not delete subtask if not confirmed', async () => {
            notificationService.showConfirmation.and.returnValue(Promise.resolve(false));

            await store.deleteSubtask(mockTodo.id, mockSubtask.id);

            expect(store.todos()[0].subtasks).toEqual([mockSubtask]);
            expect(todoService.deleteSubTask).not.toHaveBeenCalled();
        });
    });

    describe('Computed Properties', () => {
        beforeEach(async () => {
            const todos = [
                { ...mockTodo, id: '1', status: TODO_STATUS.PENDING },
                { ...mockTodo, id: '2', status: TODO_STATUS.IN_PROGRESS },
                { ...mockTodo, id: '3', status: TODO_STATUS.COMPLETED },
                { ...mockTodo, id: '4', status: TODO_STATUS.PENDING }
            ];
            todoService.getAllTodos.and.returnValue(of(todos));
            await store.loadTodos();
        });

        it('should calculate counts correctly', () => {
            const counts = store.counts();
            expect(counts.pending).toBe(2);
            expect(counts.inProgress).toBe(1);
            expect(counts.completed).toBe(1);
            expect(counts.total).toBe(4);
        });

        it('should filter todos correctly', () => {
            store.setFilter(TODO_STATUS.PENDING);
            expect(store.filteredTodos().length).toBe(2);
            
            store.setFilter(TODO_STATUS.IN_PROGRESS);
            expect(store.filteredTodos().length).toBe(1);
            
            store.setFilter(TODO_STATUS.COMPLETED);
            expect(store.filteredTodos().length).toBe(1);
            
            store.setFilter(TODO_STATUS.ALL);
            expect(store.filteredTodos().length).toBe(4);
        });
    });

    describe('Filter Actions', () => {
        it('should set filter correctly', () => {
            store.setFilter(TODO_STATUS.PENDING);
            expect(store.filter()).toBe(TODO_STATUS.PENDING);
        });

        it('should clear filter correctly', () => {
            store.setFilter(TODO_STATUS.PENDING);
            store.clearFilter();
            expect(store.filter()).toBe(TODO_STATUS.ALL);
        });
    });

    describe('Utility Methods', () => {
        beforeEach(async () => {
            const todoWithSubtask = { ...mockTodo, subtasks: [mockSubtask] };
            todoService.getAllTodos.and.returnValue(of([todoWithSubtask]));
            await store.loadTodos();
        });

        it('should get todo by id', () => {
            const todo = store.getTodoById(mockTodo.id);
            expect(todo).toEqual(jasmine.objectContaining({ id: mockTodo.id }));
        });

        it('should return undefined for non-existent todo', () => {
            const todo = store.getTodoById('non-existent');
            expect(todo).toBeUndefined();
        });

        it('should get subtask by id', () => {
            const subtask = store.getSubtaskById(mockTodo.id, mockSubtask.id);
            expect(subtask).toEqual(jasmine.objectContaining({ id: mockSubtask.id }));
        });

        it('should return undefined for non-existent subtask', () => {
            const subtask = store.getSubtaskById(mockTodo.id, 'non-existent');
            expect(subtask).toBeUndefined();
        });
    });
});
