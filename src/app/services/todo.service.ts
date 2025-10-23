import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo, Priority } from '../models/todo.model';
import { TodoCrudService } from './todo-crud.service';
import { initialTodos } from './todo-initial.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  //RxJS observable startet mit initialTodos und todosSubject kann von components subscribed werden
  private readonly todosSubject = new BehaviorSubject<Todo[]>(initialTodos);

  todos$ = this.todosSubject.asObservable();

  //Holt sich den current state
  private get todos(): Todo[] {
    return this.todosSubject.getValue();
  }

  addTodo(titel: string, beschreibung: string, priority: Priority, endeAm: Date) {
    this.todosSubject.next(TodoCrudService.addTodo(this.todos, titel, beschreibung, priority, endeAm)); //next() für update aller components
  }

  toggleErledigt(id: number) {
    this.todosSubject.next(TodoCrudService.toggleErledigt(this.todos, id));
  }

  updateTodo(id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date) {
    this.todosSubject.next(TodoCrudService.updateTodo(this.todos, id, titel, beschreibung, priority, endeAm));
  }

  deleteTodo(id: number) {
    this.todosSubject.next(TodoCrudService.deleteTodo(this.todos, id));
  }


  getTodos() {
    return this.todos$; //oberservable stream für app.ts
  }
}
