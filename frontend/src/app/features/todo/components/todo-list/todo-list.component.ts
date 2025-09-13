import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { Todo, SubTask, CreateSubTaskRequest } from '../../models/todo.types';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent {
  @Input({ required: true }) todos!: Todo[];
  @Input({ required: true }) isLoading!: boolean;

  @Output() todoUpdated = new EventEmitter<Todo>();
  @Output() todoDeleted = new EventEmitter<string>();
  @Output() subtaskAdded = new EventEmitter<{ todoId: string; subtask: CreateSubTaskRequest }>();
  @Output() subtaskUpdated = new EventEmitter<{ todoId: string; subtaskId: string; updates: Partial<SubTask> }>();
  @Output() subtaskDeleted = new EventEmitter<{ todoId: string; subtaskId: string }>();

  onTodoUpdated(updatedTodo: Todo): void {
    this.todoUpdated.emit(updatedTodo);
  }

  onTodoDeleted(todoId: string): void {
    this.todoDeleted.emit(todoId);
  }

  onSubtaskAdded(event: { todoId: string; subtask: CreateSubTaskRequest }): void {
    this.subtaskAdded.emit(event);
  }

  onSubtaskUpdated(event: { todoId: string; subtaskId: string; updates: Partial<SubTask> }): void {
    this.subtaskUpdated.emit(event);
  }

  onSubtaskDeleted(event: { todoId: string; subtaskId: string }): void {
    this.subtaskDeleted.emit(event);
  }
}
