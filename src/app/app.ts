import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { TodoService } from './services/todo.service';
import { Todo, Priority } from './models/todo.model';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { HeaderStatsComponent } from './components/header-stats/header-stats.component';
import { NewTodoFormComponent } from './components/new-todo-form/new-todo-form.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    HeaderStatsComponent,
    NewTodoFormComponent,
    FilterBarComponent,
    SearchBarComponent,
    TodoListComponent,
    RouterOutlet
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  // Title kept as a signal (used by header component to render heading text if desired)
  title = signal('Angular To-Do App');
  
  // BehaviorSubjects represent UI state: filters and search term
  status$ = new BehaviorSubject<'alle'|'offen'|'erledigt'>('alle');
  priority$ = new BehaviorSubject<Priority|'alle'>('alle');
  search$ = new BehaviorSubject<string>('');

  // Convert the service's todos signal to an observable for RxJS composition
  todos$!: ReturnType<typeof toObservable<Todo[]>>;

  // These will be initialized in the constructor after todos$ is available
  searchDebounced$!: any;
  filteredTodos$!: any;
  totalCount$!: any;
  openCount$!: any;
  doneCount$!: any;

  constructor(protected todoService: TodoService) {
    // Initialize todos$ after service is available
    this.todos$ = toObservable(this.todoService.getTodos()) as ReturnType<typeof toObservable<Todo[]>>;
    
    // Initialize derived observables after todos$ is available
    this.searchDebounced$ = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    // Combine todos with filters and search into one derived stream powering the list
    this.filteredTodos$ = combineLatest([
      this.todos$,
      this.status$,
      this.priority$,
      this.searchDebounced$
    ]).pipe(
      map((data: any) => {
        const [todos, status, priority, term] = data;
        const q = term.trim().toLowerCase();
        let res = todos;
        if (status === 'offen') res = res.filter((t: Todo) => !t.erledigt);
        else if (status === 'erledigt') res = res.filter((t: Todo) => t.erledigt);
        if (priority !== 'alle') res = res.filter((t: Todo) => t.priority === priority);
        if (q) {
          res = res.filter((t: Todo) =>
            t.titel.toLowerCase().includes(q) ||
            t.beschreibung.toLowerCase().includes(q)
          );
        }
        return res;
      })
    );

    // Derived counters for header stats
    this.totalCount$ = this.todos$.pipe(map((t: Todo[]) => t.length));
    this.openCount$ = this.todos$.pipe(map((t: Todo[]) => t.filter((x: Todo) => !x.erledigt).length));
    this.doneCount$ = this.todos$.pipe(map((t: Todo[]) => t.filter((x: Todo) => x.erledigt).length));
  }

  // Handlers called by child components (pure orchestration)
  handleCreate(evt: { titel: string; beschreibung: string; priority: Priority; endeAm: Date }) {
    this.todoService.addTodo(evt.titel.trim(), (evt.beschreibung || '').trim(), evt.priority);
    // Extend addTodo if you want to store endeAm from evt
  }

  handleReorder(reordered: Todo[]) {
    this.todoService.reorderTodos(reordered);
  }

  handleToggle(id: number) {
    this.todoService.toggleErledigt(id);
  }

  handleSave({ id, titel, beschreibung, priority, endeAm }: { id: number; titel: string; beschreibung: string; priority: Priority; endeAm: Date }) {
    this.todoService.updateTodo(id, titel.trim(), (beschreibung || '').trim(), priority, endeAm);
  }

  handleDelete(id: number) {
    this.todoService.deleteTodo(id);
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

