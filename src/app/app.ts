import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
// Removed unused Material imports for sidenav, buttons, icons, toolbar, and tooltips
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';

import { TodoService } from './services/todo.service';
import { Todo, Priority } from './models/todo.model';
import { ModernTodoLayoutComponent } from './components/modern-todo-layout/modern-todo-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatNativeDateModule,
    ModernTodoLayoutComponent,
    RouterOutlet
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Removed old filter subjects as they're now handled by the enhanced table component

  todos$;
  totalCount$;
  openCount$;
  doneCount$;

  constructor(private todoService: TodoService) {
    // Initialize todos observable
    this.todos$ = this.todoService.getTodos();
    
    // Calculate statistics for header
    this.totalCount$ = this.todos$.pipe(map(t => t.length));
    this.openCount$ = this.todos$.pipe(map(t => t.filter(x => !x.erledigt).length));
    this.doneCount$ = this.todos$.pipe(map(t => t.filter(x => x.erledigt).length));
  }

  /**
   * Handles todo creation from the enhanced table component
   */
  handleCreate(evt: { titel: string; beschreibung: string; priority: Priority; endeAm: Date }) {
    console.log('Creating new todo:', evt);
    this.todoService.addTodo(evt.titel.trim(), evt.beschreibung.trim(), evt.priority);
  }

  /**
   * Handles todo updates from the enhanced table component
   */
  handleUpdate(evt: Todo) {
    console.log('Updating todo:', evt);
    this.todoService.updateTodo(evt.id, evt.titel.trim(), evt.beschreibung.trim(), evt.priority, evt.endeAm);
  }

  /**
   * Handles todo status toggle from the enhanced table component
   */
  handleToggle(id: number) {
    console.log('Toggling todo status:', id);
    this.todoService.toggleErledigt(id);
  }

  /**
   * Handles todo deletion from the enhanced table component
   */
  handleDelete(id: number) {
    console.log('Deleting todo:', id);
    this.todoService.deleteTodo(id);
  }
}
