import { Component, inject } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TodoService } from './services/todo.service';
import { Todo, Priority } from './models/todo.model';
import { TodoLayoutComponent } from './components/todo-layout/todo-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TodoLayoutComponent
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  private todoService = inject(TodoService);

  todos$ = this.todoService.getTodos();

  //Event Handler Bereich
  //fürs erstellen von todo, trimt titel/beschreibung und sendet an todoService
  handleCreate(evt: { titel: string; beschreibung: string; priority: Priority; endeAm: Date }) {
    console.log('Creating new todo:', evt);
    this.todoService.addTodo(evt.titel.trim(), evt.beschreibung.trim(), evt.priority, evt.endeAm);
  }
  //bearbeiten
  handleUpdate(evt: Todo) {
    console.log('Updating todo:', evt);
    this.todoService.updateTodo(evt.id, evt.titel.trim(), evt.beschreibung.trim(), evt.priority, evt.endeAm);
  }
  //abhacken von todos
  handleToggle(id: number) {
    console.log('Toggling todo status:', id);
    this.todoService.toggleErledigt(id);
  }
  //löschen
  handleDelete(id: number) {
    console.log('Deleting todo:', id);
    this.todoService.deleteTodo(id);
  }
}
