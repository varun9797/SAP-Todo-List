import { Component, OnInit, inject } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { TodoStore } from '../../store/todo.store';
import { NotificationService } from '../../../../shared/services/notification.service';
import { FilterStatus } from '../../constants/todo.constants';

@Component({
  selector: 'app-todo-container',
  imports: [TodoFormComponent, TodoListComponent, TodoFilterComponent, NotificationComponent],
  templateUrl: './todo-container.component.html',
  styleUrl: './todo-container.component.scss'
})
export class TodoContainerComponent implements OnInit {
  private readonly todoStore = inject(TodoStore);
  readonly notificationService = inject(NotificationService);

  // Expose store state to template
  readonly todos = this.todoStore.todos;
  readonly filteredTodos = this.todoStore.filteredTodos;
  readonly counts = this.todoStore.counts;
  readonly isLoading = this.todoStore.loading;
  readonly currentNotification = this.notificationService.notification;

  ngOnInit(): void {
    this.todoStore.loadTodos();
  }

  onFilterChange(filterStatus: FilterStatus): void {
    this.todoStore.setFilter(filterStatus);
  }
}
