import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

// Import services and stores to ensure they're covered
import { TodoService } from './features/todo/services/todo.service';
import { NotificationService } from './shared/services/notification.service';
import { TodoStore } from './features/todo/store/todo.store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TodoService,
        NotificationService,
        TodoStore
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Todo Management');
  });

  it('should have TodoService available', () => {
    const service = TestBed.inject(TodoService);
    expect(service).toBeTruthy();
  });

  it('should have NotificationService available', () => {
    const service = TestBed.inject(NotificationService);
    expect(service).toBeTruthy();
  });
});
