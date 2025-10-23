import { Todo, Priority } from '../models/todo.model';
import { initialTodos } from './todo.initial';

export class TodoCrud {
  private static idCounter = initialTodos.length; // max-idinitialisieren

  static initialTodos = initialTodos;

  static addTodo(todos: Todo[], titel: string, beschreibung: string, priority: Priority): Todo[] {
    const newTodo: Todo = {
      id: this.idCounter + 1,
      titel,
      beschreibung,
      priority,
      erledigt: false,
      erstelltAm: new Date(),
      endeAm: new Date()
    };
    this.idCounter += 1;
    return [...todos, newTodo];
  }

  static toggleErledigt(todos: Todo[], id: number): Todo[] {
    return todos.map(todo =>
      todo.id === id ? { ...todo, erledigt: !todo.erledigt } : todo
    );
  }

  static updateTodo(todos: Todo[], id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date): Todo[] {
    return todos.map(todo =>
      todo.id === id ? { ...todo, titel, beschreibung, priority, endeAm } : todo
    );
  }

  static deleteTodo(todos: Todo[], id: number): Todo[] {
    return todos.filter(todo => todo.id !== id);
  }

  static reorderTodos(_: Todo[], reordered: Todo[]): Todo[] {
    return reordered;
  }
}
