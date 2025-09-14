import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TODO_STATUS, FilterStatus } from '../../constants/todo.constants';
import { TodoStore } from '../../store/todo.store';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.scss'
})
export class TodoFilterComponent {
  private readonly todoStore = inject(TodoStore);
  readonly todos = this.todoStore.todos;
  readonly counts = this.todoStore.counts;

  // Filter state
  filterStatus = signal<FilterStatus>(TODO_STATUS.ALL);

  // Filter options for template
  readonly TODO_STATUS_OPTIONS = [
    { value: TODO_STATUS.PENDING, label: 'Pending' },
    { value: TODO_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TODO_STATUS.COMPLETED, label: 'Completed' }
  ];
  readonly FILTER_OPTIONS = [
    { value: TODO_STATUS.ALL, label: 'All' },
    ...this.TODO_STATUS_OPTIONS
  ];

  onFilterChange(): void {
    this.todoStore.setFilter(this.filterStatus());
  }
}
