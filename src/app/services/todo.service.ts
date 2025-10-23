import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo, Priority } from '../models/todo.model';
import { TodoCrud } from './todo.crud';
import { initialTodos } from './todo.initial';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly todosSubject = new BehaviorSubject<Todo[]>(initialTodos);

  todos$ = this.todosSubject.asObservable();

  private get todos(): Todo[] {
    return this.todosSubject.getValue();
  }

  addTodo(titel: string, beschreibung: string, priority: Priority) {
    this.todosSubject.next(TodoCrud.addTodo(this.todos, titel, beschreibung, priority));
  }

  toggleErledigt(id: number) {
    this.todosSubject.next(TodoCrud.toggleErledigt(this.todos, id));
  }

  updateTodo(id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date) {
    this.todosSubject.next(TodoCrud.updateTodo(this.todos, id, titel, beschreibung, priority, endeAm));
  }

  deleteTodo(id: number) {
    this.todosSubject.next(TodoCrud.deleteTodo(this.todos, id));
  }

  reorderTodos(reordered: Todo[]) {
    this.todosSubject.next(TodoCrud.reorderTodos(this.todos, reordered));
  }

  getTodos() {
    return this.todos$;
  }
}
