import { Component, inject } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoFilterComponent } from '../todo-filter/todo-filter.component';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-todo-container',
  imports: [TodoFormComponent, TodoListComponent, TodoFilterComponent, NotificationComponent],
  templateUrl: './todo-container.component.html',
  styleUrl: './todo-container.component.scss'
})
export class TodoContainerComponent {
  readonly notificationService = inject(NotificationService);
  readonly currentNotification = this.notificationService.notification;
}
