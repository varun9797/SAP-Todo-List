import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFilterComponent } from './todo-filter.component';

describe('TodoFilterComponent', () => {
  let component: TodoFilterComponent;
  let fixture: ComponentFixture<TodoFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoFilterComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('todos', []);
    fixture.componentRef.setInput('pendingCount', 0);
    fixture.componentRef.setInput('inProgressCount', 0);
    fixture.componentRef.setInput('completedCount', 0);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
