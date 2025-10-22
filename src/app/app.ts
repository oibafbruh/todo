import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { TodoService } from './services/todo.service';
import { Todo, Priority } from './models/todo.model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    DragDropModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  title = signal('Angular To-Do App');
  
  constructor(protected todoService: TodoService){  
    //this.setDefaultDate();
  }

  //setDefaultDate(){
  //  const nextWeek = new Date();
  //  nextWeek.setDate(today.getDate()+7);
  //  this.neueendeAm = nextWeek;
  //}

  //New todo
  neuerTitel = '';
  neueBeschreibung = '';
  neuePriority: Priority = 'mittel';
  neueendeAm: Date = new Date(new Date().setDate(new Date().getDate() + 7)); //Setzt das Enddatum auf heute in einer Woche...
  
  // neueendeAm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  
  //Mit Form Control 
  // endDate = new FormControl(new Date(new Date().setDate(new Date().getDate() + 7))); 

  // edit todo
  bearbeitenId: number | null = null;
  bearbeitenTitel = '';
  bearbeitenBeschreibung = '';
  bearbeitenPriority: Priority = 'mittel';
  bearbeitenendeAm = new Date();

  // filter by status and prioprity
  filterStatus = signal<'alle' | 'offen' | 'erledigt'>('alle');
  filterPriority = signal<Priority | 'alle'>('alle');

  get todos() {
    return this.todoService.getTodos();
  }

  gefilterteTodos = computed(() => {
    let todos = this.todos();
    const statusFilter = this.filterStatus();
    const priorityFilter = this.filterPriority();
    
    if (statusFilter === 'offen') {
      todos = todos.filter(t => !t.erledigt);
    } else if (statusFilter === 'erledigt') {
      todos = todos.filter(t => t.erledigt);
    }
    
    if (priorityFilter !== 'alle') {
      todos = todos.filter(t => t.priority === priorityFilter);
    }
    
    return todos;
  });

  offeneTodos = computed(() => this.todos().filter(t => !t.erledigt).length);
  erledigteAnzahl = computed(() => this.todos().filter(t => t.erledigt).length);

  hinzufuegen(): void {
    if (this.neuerTitel.trim()) {
      this.todoService.addTodo(
        this.neuerTitel.trim(), 
        this.neueBeschreibung.trim(),
        this.neuePriority
      );
      this.neuerTitel = '';
      this.neueBeschreibung = '';
      this.neuePriority = 'mittel';
    }
  }

  startBearbeiten(todo: Todo): void {
    this.bearbeitenId = todo.id;
    this.bearbeitenTitel = todo.titel;
    this.bearbeitenBeschreibung = todo.beschreibung;
    this.bearbeitenPriority = todo.priority;
    this.bearbeitenendeAm = todo.endeAm;
  }

  speichern(): void {
    if (this.bearbeitenId !== null && this.bearbeitenTitel.trim()) {
      this.todoService.updateTodo(
        this.bearbeitenId,
        this.bearbeitenTitel.trim(),
        this.bearbeitenBeschreibung.trim(),
        this.bearbeitenPriority,
        this.bearbeitenendeAm
      );
      this.abbrechenBearbeiten();
    }
  }

  abbrechenBearbeiten(): void {
    this.bearbeitenId = null;
    this.bearbeitenTitel = '';
    this.bearbeitenBeschreibung = '';
    this.bearbeitenPriority = 'mittel';
  }

  toggleErledigt(id: number): void {
    this.todoService.toggleErledigt(id);
  }

  loeschen(id: number): void {
    this.todoService.deleteTodo(id);
    if (this.bearbeitenId === id) {
      this.abbrechenBearbeiten();
    }
  }

  setStatusFilter(filter: 'alle' | 'offen' | 'erledigt'): void {
    this.filterStatus.set(filter);
  }

  setPriorityFilter(filter: Priority | 'alle'): void {
    this.filterPriority.set(filter);
  }

  getPriorityClass(priority: Priority): string {
    return `priority-${priority}`;
  }

  getPriorityLabel(priority: Priority): string {
    const labels = {
      'niedrig': 'Niedrig',
      'mittel': 'Mittel',
      'hoch': 'Hoch'
    };
    return labels[priority];
  }

  onTodoDrop(event: CdkDragDrop<Todo[]>): void {
    const todos = [...this.gefilterteTodos()];
    moveItemInArray(todos, event.previousIndex, event.currentIndex);
    this.todoService.reorderTodos(todos);
  }
}

// import { Component, signal, computed } from '@angular/core';
// import { bootstrapApplication } from '@angular/platform-browser';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [FormsModule],
//   template: `
//     <h2>Cookie recipe</h2>

//     <label>
//       # of cookies:
//       <input type="range"
//              min="10"
//              max="100"
//              step="10"
//              [ngModel]="count()"
//              (ngModelChange)="count.set($event)" />
//       {{ count() }}
//     </label>

//     <p>Butter: {{ butter() }} cup(s)</p>
//     <p>Sugar: {{ sugar() }} cup(s)</p>
//     <p>Flour: {{ flour() }} cup(s)</p>
//   `,
// })
// export class CookieRecipe {
//   readonly count = signal(10);

//   readonly butter = computed(() => this.count() * 0.1);
//   readonly sugar = computed(() => this.count() * 0.05);
//   readonly flour = computed(() => this.count() * 0.2);
// }

// bootstrapApplication(CookieRecipe);

