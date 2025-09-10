import { Component } from '@angular/core';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoListComponent } from '../todo-list/todo-list.component';


@Component({
  selector: 'app-todo-container',
  imports: [TodoFormComponent, TodoListComponent],
  templateUrl: './todo-container.component.html',
  styleUrl: './todo-container.component.scss'
})
export class TodoContainerComponent {

}
