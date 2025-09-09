import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TodoContainerComponent } from './todo-container.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationData } from '../../../../shared/components/notification/notification.component';
import { TodoStore } from '../../store/todo.store';
import { Todo } from '../../models/todo.types';

describe('TodoContainerComponent', () => {
  let component: TodoContainerComponent;
  let fixture: ComponentFixture<TodoContainerComponent>;
  let mockNotificationService: {
    notification: ReturnType<typeof signal<NotificationData | null>>;
    showSuccess: jasmine.Spy;
    showError: jasmine.Spy;
    showWarning: jasmine.Spy;
    showInfo: jasmine.Spy;
    showConfirmation: jasmine.Spy;
    onConfirmed: jasmine.Spy;
    onCancelled: jasmine.Spy;
    show: jasmine.Spy;
    hide: jasmine.Spy;
    clear: jasmine.Spy;
  };
  let mockTodoStore: {
    filteredTodos: ReturnType<typeof signal<Todo[]>>;
    todos: ReturnType<typeof signal<Todo[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    counts: ReturnType<typeof signal<{pending: number; inProgress: number; completed: number; total: number}>>;
    loadTodos: jasmine.Spy;
    createTodo: jasmine.Spy;
    updateTodo: jasmine.Spy;
    deleteTodo: jasmine.Spy;
  };

  beforeEach(async () => {
    mockNotificationService = {
      notification: signal(null),
      showSuccess: jasmine.createSpy('showSuccess'),
      showError: jasmine.createSpy('showError'),
      showWarning: jasmine.createSpy('showWarning'),
      showInfo: jasmine.createSpy('showInfo'),
      showConfirmation: jasmine.createSpy('showConfirmation').and.returnValue(Promise.resolve(false)),
      onConfirmed: jasmine.createSpy('onConfirmed'),
      onCancelled: jasmine.createSpy('onCancelled'),
      show: jasmine.createSpy('show'),
      hide: jasmine.createSpy('hide'),
      clear: jasmine.createSpy('clear')
    };

    mockTodoStore = {
      filteredTodos: signal([]),
      todos: signal([]),
      loading: signal(false),
      counts: signal({ pending: 0, inProgress: 0, completed: 0, total: 0 }),
      loadTodos: jasmine.createSpy('loadTodos'),
      createTodo: jasmine.createSpy('createTodo').and.returnValue(Promise.resolve()),
      updateTodo: jasmine.createSpy('updateTodo').and.returnValue(Promise.resolve()),
      deleteTodo: jasmine.createSpy('deleteTodo').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [TodoContainerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TodoStore, useValue: mockTodoStore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject NotificationService', () => {
    expect(component.notificationService).toBeDefined();
    expect(component.notificationService).toBe(mockNotificationService);
  });

  it('should expose current notification from service', () => {
    expect(component.currentNotification).toBeDefined();
    expect(component.currentNotification()).toBe(null);
  });

  it('should react to notification changes', () => {
    const testNotification: NotificationData = {
      type: 'success',
      message: 'Test notification'
    };
    
    mockNotificationService.notification.set(testNotification);
    fixture.detectChanges();
    
    expect(component.currentNotification()).toEqual(testNotification);
  });

  it('should contain todo form component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const todoForm = compiled.querySelector('app-todo-form');
    expect(todoForm).toBeTruthy();
  });

  it('should contain todo list component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const todoList = compiled.querySelector('app-todo-list');
    expect(todoList).toBeTruthy();
  });

  it('should contain todo filter component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const todoFilter = compiled.querySelector('app-todo-filter');
    expect(todoFilter).toBeTruthy();
  });

  it('should contain notification component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('app-notification');
    expect(notification).toBeTruthy();
  });

  it('should handle null notifications', () => {
    mockNotificationService.notification.set(null);
    fixture.detectChanges();
    
    expect(component.currentNotification()).toBe(null);
  });
});
