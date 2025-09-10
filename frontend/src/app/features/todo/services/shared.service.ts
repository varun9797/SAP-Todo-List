import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo } from '../models/todo.types';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private addItemToList = new BehaviorSubject<Todo>({} as Todo);
  _addItemToList$ = this.addItemToList.asObservable();

  triggerAddItemToList(item: Todo) {
    this.addItemToList.next(item);
  }

}
