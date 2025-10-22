import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Todo, Priority } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // Internal BehaviorSubject state
  private readonly todosSubject = new BehaviorSubject<Todo[]>([
        {
      id: 1,
      titel: 'Ausschlafen am Wochenende',
      beschreibung: 'Das ist eine Aufgabe mit hoher Priorität',
      priority: 'hoch',
      erledigt: false,
      erstelltAm: new Date(2025, 9, 16, 16, 12),
      endeAm: new Date(2025, 9, 28, 12, 71)
    },
    {
      id: 2,
      titel: 'Docker Network verstehen',
      beschreibung: 'Subnetze zwischen Containern und Traefik Proxy',
      priority: 'mittel',
      erledigt: false,
      erstelltAm: new Date(2025, 9, 15, 15, 32),
      endeAm: new Date(2025, 9, 21, 13, 58)
    },
    {
      id: 3,
      titel: 'Angular Tutorial abschließen',
      beschreibung: 'Hello World und Häuser App',
      priority: 'niedrig',
      erledigt: true,
      erstelltAm: new Date(2025, 9, 13, 9, 58),
      endeAm: new Date(2025, 10, 24, 6, 15)
    },
    {
      id: 4,
      titel: 'Wochenmeeting beitreten',
      beschreibung: 'Donnerstag 09:00 - 09:45',
      priority: 'mittel',
      erledigt: false,
      erstelltAm: new Date(2025, 9, 15, 17, 8),
      endeAm: new Date(2025, 9, 30, 15, 32)
    }
  ]);

  // Expose as Observable
  todos$ = this.todosSubject.asObservable();

  // Get current snapshot value
  private get todos(): Todo[] {
    return this.todosSubject.getValue();
  }

  // --- CRUD methods below ---

  addTodo(titel: string, beschreibung: string, priority: Priority) {
    const newTodo: Todo = {
      id: Date.now(),
      titel,
      beschreibung,
      priority,
      erledigt: false,
      erstelltAm: new Date(),
      endeAm: new Date()
    };
    this.todosSubject.next([...this.todos, newTodo]);
  }

  toggleErledigt(id: number) {
    const updated = this.todos.map(todo =>
      todo.id === id ? { ...todo, erledigt: !todo.erledigt } : todo
    );
    this.todosSubject.next(updated);
  }

  updateTodo(id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date) {
    const updated = this.todos.map(todo =>
      todo.id === id ? { ...todo, titel, beschreibung, priority, endeAm } : todo
    );
    this.todosSubject.next(updated);
  }

  deleteTodo(id: number) {
    const filtered = this.todos.filter(todo => todo.id !== id);
    this.todosSubject.next(filtered);
  }

  reorderTodos(reordered: Todo[]) {
    this.todosSubject.next(reordered);
  }

  getTodos() {
    return this.todos$;
  }
}


    // {
    //   id: 1,
    //   titel: 'Ausschlafen am Wochenende',
    //   beschreibung: 'Das ist eine Aufgabe mit hoher Priorität',
    //   priority: 'hoch',
    //   erledigt: false,
    //   erstelltAm: new Date(2025, 9, 16, 16, 12),
    //   endeAm: new Date(2025, 9, 28, 12, 71)
    // },
    // {
    //   id: 2,
    //   titel: 'Docker Network verstehen',
    //   beschreibung: 'Subnetze zwischen Containern und Traefik Proxy',
    //   priority: 'mittel',
    //   erledigt: false,
    //   erstelltAm: new Date(2025, 9, 15, 15, 32),
    //   endeAm: new Date(2025, 9, 21, 13, 58)
    // },
    // {
    //   id: 3,
    //   titel: 'Angular Tutorial abschließen',
    //   beschreibung: 'Hello World und Häuser App',
    //   priority: 'niedrig',
    //   erledigt: true,
    //   erstelltAm: new Date(2025, 9, 13, 9, 58),
    //   endeAm: new Date(2025, 10, 24, 6, 15)
    // },
    // {
    //   id: 4,
    //   titel: 'Wochenmeeting beitreten',
    //   beschreibung: 'Donnerstag 09:00 - 09:45',
    //   priority: 'mittel',
    //   erledigt: false,
    //   erstelltAm: new Date(2025, 9, 15, 17, 8),
    //   endeAm: new Date(2025, 9, 30, 15, 32)
    // }