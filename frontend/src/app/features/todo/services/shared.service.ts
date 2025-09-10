import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../models/todo.types';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private addItemToList = new BehaviorSubject<Todo>({} as Todo);
  private isErrorWhileAddingTodo = new BehaviorSubject<boolean>(false);
  _addItemToList$ = this.addItemToList.asObservable();
  _isErrorWhileAddingTodo$ = this.isErrorWhileAddingTodo.asObservable();

  triggerAddItemToList(item: Todo) {
    this.addItemToList.next(item);
  }
  triggerErrorWhileAddingTodo(isError: boolean) {
    this.isErrorWhileAddingTodo.next(isError);
  }

}
