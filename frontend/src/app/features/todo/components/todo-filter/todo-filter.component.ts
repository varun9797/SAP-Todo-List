import { Component, EventEmitter, Output, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TODO_STATUS, FilterStatus } from '../../constants/todo.constants';
import { Todo } from '../../models/todo.types';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.scss'
})
export class TodoFilterComponent {
  @Input({ required: true }) todos!: Todo[];
  @Input({ required: true }) pendingCount!: number;
  @Input({ required: true }) inProgressCount!: number;
  @Input({ required: true }) completedCount!: number;
  @Output() filterChanged = new EventEmitter<FilterStatus>();

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
    this.filterChanged.emit(this.filterStatus());
  }

  setFilter(status: FilterStatus): void {
    this.filterStatus.set(status);
    this.onFilterChange();
  }

  getCurrentFilter(): FilterStatus {
    return this.filterStatus();
  }
}
