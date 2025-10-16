import { Injectable, signal } from '@angular/core';
import { Todo, Priority } from '../models/todo.model';

const now = new Date();
const nextWeek = new Date(now);
nextWeek.setDate(now.getDate()+7);

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos = signal<Todo[]>([
    {
      id: 1,
      titel: 'Ausschlafen am Wochenende',
      beschreibung: 'Das ist eine Aufgabe mit hoher Priorität',
      priority: 'hoch',
      erledigt: false,
      erstelltAm: new Date(2025, 9, 16, 16, 12),
      endeAm: new Date(2025, 9, 30, 15, 32)
    },
    {
      id: 2,
      titel: 'Docker Network verstehen',
      beschreibung: 'Subnetze zwischen Containern und Traefik Proxy',
      priority: 'mittel',
      erledigt: false,
      erstelltAm: new Date(2025, 9, 15, 15, 32),
      endeAm: new Date(2025, 9, 30, 15, 32)
    },
    {
      id: 3,
      titel: 'Angular Tutorial abschließen',
      beschreibung: 'Hello World und Häuser App',
      priority: 'niedrig',
      erledigt: true,
      erstelltAm: new Date(2025, 9, 13, 9, 58),
      endeAm: new Date(2025, 9, 30, 15, 32)
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
  
  private nextId = 5; //Problem 

  getTodos() {
    return this.todos.asReadonly();
  }

  addTodo(titel: string, beschreibung: string, priority: Priority): void {
    const neuesToDo: Todo = {
      id: this.nextId++,
      titel,
      beschreibung,
      priority,
      erledigt: false,
      erstelltAm: new Date(),
      endeAm: nextWeek
    };
    this.todos.update(todos => [...todos, neuesToDo]);
  }

  updateTodo(id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, titel, beschreibung, priority, endeAm } : todo
      )
    );
  }

  toggleErledigt(id: number): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, erledigt: !todo.erledigt } : todo
      )
    );
  }

  deleteTodo(id: number): void {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
  }

  reorderTodos(reorderedTodos: Todo[]): void {
    this.todos.set(reorderedTodos);
  }
}

