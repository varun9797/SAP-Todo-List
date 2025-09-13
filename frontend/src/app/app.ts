import { Component } from '@angular/core';
import { TodoContainerComponent } from './features/todo/components/todo-container/todo-container.component';

@Component({
  selector: 'app-root',
  imports: [TodoContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App { }
