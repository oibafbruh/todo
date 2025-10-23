import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { 
  BehaviorSubject, 
  combineLatest, 
  map, 
  Subject, 
  takeUntil, 
  Observable, 
  of, 
  catchError,
  startWith
} from 'rxjs';

import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';

export interface FilterState {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-todo-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './todo-layout.component.html',
  styleUrls: ['./todo-layout.component.scss']
})
export class TodoLayoutComponent implements OnInit, OnDestroy {
  @Input() todos$!: Observable<Todo[]>;
  @Output() create = new EventEmitter<Omit<Todo, 'id' | 'erstelltAm'>>();
  @Output() update = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<number>();

  // UI State
  isLoading$ = new BehaviorSubject<boolean>(false);
  
  // New Todo Creation
  newTodo: Partial<Todo> = {
    titel: '',
    beschreibung: '',
    priority: 'niedrig',
    endeAm: new Date(),
    erledigt: false
  };
  isCreatingNew = false;

  // Filter State
  currentFilter: FilterState = {
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  };

  // Reactive Streams
  private destroy$ = new Subject<void>();
  private filterSubject = new BehaviorSubject<FilterState>(this.currentFilter);
  filteredTodos$!: Observable<Todo[]>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupReactiveStreams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupReactiveStreams(): void {
    this.filteredTodos$ = combineLatest([
      this.todos$.pipe(
        startWith([]),
        catchError(error => {
          console.error('Error loading todos:', error);
          this.snackBar.open('Fehler beim Laden der Todos', 'Schließen', { duration: 3000 });
          return of([]);
        })
      ),
      this.filterSubject.asObservable()
    ]).pipe(
      map(([todos, filter]) => {
        let filtered = this.applyFilters(todos, filter);
        return this.applySorting(filtered, filter);
      }),
      takeUntil(this.destroy$)
    );
  }

  private applyFilters(todos: Todo[], filter: FilterState): Todo[] {
    return todos.filter(todo => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matches = todo.titel.toLowerCase().includes(q) ||
                        todo.beschreibung.toLowerCase().includes(q) ||
                        todo.id.toString().includes(q);
        if (!matches) return false;
      }
      if (filter.status !== 'alle') {
        const isCompleted = filter.status === 'erledigt';
        if (todo.erledigt !== isCompleted) return false;
      }
      if (filter.priority !== 'alle') {
        if (todo.priority !== filter.priority) return false;
      }
      return true;
    });
  }

  private applySorting(todos: Todo[], filter: FilterState): Todo[] {
    return [...todos].sort((a, b) => {
      let aValue: any, bValue: any;
      switch (filter.sortBy) {
        case 'titel':
          aValue = a.titel.toLowerCase();
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':
          const order = { niedrig: 1, mittel: 2, hoch: 3 } as const;
          aValue = order[a.priority];
          bValue = order[b.priority];
          break;
        case 'erstelltAm':
        case 'endeAm':
          aValue = new Date(a[filter.sortBy]).getTime();
          bValue = new Date(b[filter.sortBy]).getTime();
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Filter handlers
  onSearchChange(event: any): void { this.currentFilter.search = event.target.value; this.filterSubject.next(this.currentFilter); }
  onFilterChange(): void { this.filterSubject.next(this.currentFilter); }
  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void { this.currentFilter.status = status; this.onFilterChange(); }
  setSort(sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): void { this.currentFilter.sortBy = sortBy; this.currentFilter.sortOrder = sortOrder; this.onFilterChange(); }
  clearSearch(): void { this.currentFilter.search = ''; this.onSearchChange({ target: { value: '' } }); }
  clearAllFilters(): void { this.currentFilter = { search: '', status: 'alle', priority: 'alle', sortBy: 'erstelltAm', sortOrder: 'desc' }; this.onFilterChange(); }
  hasActiveFilters(): boolean { return this.currentFilter.search !== '' || this.currentFilter.status !== 'alle' || this.currentFilter.priority !== 'alle'; }

  // Dialog
  openEditDialog(todo: Todo): void {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, { width: '600px', data: { mode: 'edit', todo } as TodoFormData });
    dialogRef.afterClosed().subscribe(result => { if (result) { this.update.emit(result); this.snackBar.open('Todo aktualisiert', 'Schließen', { duration: 2000 }); } });
  }

  // CRUD Event Handlers
  onUpdate(todo: Todo): void { this.update.emit(todo); }
  onDelete(id: number): void { if (confirm('Möchten Sie dieses Todo wirklich löschen?')) { this.delete.emit(id); } }
  onToggle(id: number): void { this.toggle.emit(id); }

  // New Todo
  startCreatingNew(): void { this.isCreatingNew = true; this.newTodo = { titel: '', beschreibung: '', priority: 'niedrig', endeAm: new Date(), erledigt: false }; }
  cancelCreatingNew(): void { this.isCreatingNew = false; this.newTodo = { titel: '', beschreibung: '', priority: 'niedrig', endeAm: new Date(), erledigt: false }; }
  saveNewTodo(): void { if (this.isNewTodoValid()) { this.create.emit(this.newTodo as Omit<Todo, 'id' | 'erstelltAm'>); this.cancelCreatingNew(); this.snackBar.open('Todo erstellt', 'Schließen', { duration: 2000 }); } }
  isNewTodoValid(): boolean { return !!(this.newTodo.titel?.trim() && this.newTodo.beschreibung?.trim() && this.newTodo.priority && this.newTodo.endeAm); }
  getPriorityLabel(priority: Priority): string { const labels = { niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' }; return labels[priority]; }
  isOverdue(todo: Todo): boolean { return !todo.erledigt && new Date(todo.endeAm) < new Date(); }
}
