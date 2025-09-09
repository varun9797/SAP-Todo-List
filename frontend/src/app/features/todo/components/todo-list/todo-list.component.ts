import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemComponent } from './todo-item/todo-item.component';

import { TodoStore } from '../../store/todo.store';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  private readonly todoStore = inject(TodoStore);
  readonly todos = this.todoStore.filteredTodos;
  readonly isLoading = this.todoStore.loading;
  readonly filteredTodos = this.todoStore.filteredTodos;


  ngOnInit(): void {
    this.todoStore.loadTodos();
  }
}
