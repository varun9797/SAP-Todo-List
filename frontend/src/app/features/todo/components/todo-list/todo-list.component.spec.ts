import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TodoListComponent } from './todo-list.component';
import { TodoStore } from '../../store/todo.store';
import { Todo } from '../../models/todo.types';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockTodoStore: {
    filteredTodos: ReturnType<typeof signal<Todo[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    loadTodos: jasmine.Spy;
  };

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'Test Description 1',
      status: 'pending',
      subtasks: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'Test Description 2',
      status: 'completed',
      subtasks: [],
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    }
  ];

  beforeEach(async () => {
    mockTodoStore = {
      filteredTodos: signal(mockTodos),
      loading: signal(false),
      loadTodos: jasmine.createSpy('loadTodos')
    };

    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [
        { provide: TodoStore, useValue: mockTodoStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load todos on init', () => {
    component.ngOnInit();
    expect(mockTodoStore.loadTodos).toHaveBeenCalled();
  });

  it('should display todos from store', () => {
    fixture.detectChanges();
    expect(component.todos()).toEqual(mockTodos);
    expect(component.filteredTodos()).toEqual(mockTodos);
  });

  it('should show loading state', () => {
    mockTodoStore.loading.set(true);
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
  });

  it('should handle empty todos list', () => {
    mockTodoStore.filteredTodos.set([]);
    fixture.detectChanges();
    expect(component.filteredTodos()).toEqual([]);
  });

  it('should initialize with store dependencies', () => {
    expect(component.todos).toBeDefined();
    expect(component.isLoading).toBeDefined();
    expect(component.filteredTodos).toBeDefined();
  });

  it('should call loadTodos on component initialization', () => {
    const spy = spyOn(component, 'ngOnInit').and.callThrough();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(mockTodoStore.loadTodos).toHaveBeenCalled();
  });
});
