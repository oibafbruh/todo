import { Todo, Priority } from '../models/todo.model';
import { initialTodos } from './todo-initial.service';

export class TodoCrudService {
  private static idCounter = initialTodos.length; // max-id initialisieren für addTodo autoincrement

  static initialTodos = initialTodos;

  //Todo erstellen
  static addTodo(todos: Todo[], titel: string, beschreibung: string, priority: Priority, endeAm: Date): Todo[] {
    const newTodo: Todo = {
      id: this.idCounter + 1, //auto increment -- vielleicht besser mit new Date()?
      titel,
      beschreibung,
      priority,
      erledigt: false,
      erstelltAm: new Date(),
      endeAm: endeAm
    };
    this.idCounter += 1;
    return [...todos, newTodo]; //update, spread operator
  }
  //Todo abhacken
  static toggleErledigt(todos: Todo[], id: number): Todo[] {
    return todos.map(todo =>
      todo.id === id ? { ...todo, erledigt: !todo.erledigt } : todo
    );
  }
  //Todo bearbeiten
  static updateTodo(todos: Todo[], id: number, titel: string, beschreibung: string, priority: Priority, endeAm: Date): Todo[] {
    return todos.map(todo =>
      todo.id === id ? { ...todo, titel, beschreibung, priority, endeAm } : todo
    );
  }
  //Todo löschen
  static deleteTodo(todos: Todo[], id: number): Todo[] {
    return todos.filter(todo => todo.id !== id);
  }
}
