import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { 
  BehaviorSubject, 
  combineLatest, 
  map, 
  Subject, 
  takeUntil, 
  Observable, 
  of, 
  catchError,
  startWith,
  tap
} from 'rxjs';

import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';

export interface TableFilter {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
}

export interface TableSort {
  active: string;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './todo-table.component.html',
  styleUrls: ['./todo-table.component.css']
})
export class TodoTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() todos$!: Observable<Todo[]>;
  @Output() create = new EventEmitter<Omit<Todo, 'id' | 'erstelltAm'>>();
  @Output() update = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<number>();

  displayedColumns: string[] = [
    'id', 'titel', 'beschreibung', 'priority', 'erledigt', 'erstelltAm', 'endeAm', 'actions'
  ];

  // RxJS streams
  private destroy$ = new Subject<void>();
  private filterSubject = new BehaviorSubject<TableFilter>({
    search: '',
    status: 'alle',
    priority: 'alle'
  });
  private sortSubject = new BehaviorSubject<TableSort>({
    active: 'erstelltAm',
    direction: 'desc'
  });
  private paginationSubject = new BehaviorSubject<TablePagination>({
    pageIndex: 0,
    pageSize: 10,
    length: 0
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // observables
  currentFilter: TableFilter = { search: '', status: 'alle', priority: 'alle' };
  filteredTodos$!: Observable<Todo[]>;
  paginatedTodos$!: Observable<Todo[]>;
  pagination$ = this.paginationSubject.asObservable();
  isLoading$ = this.loadingSubject.asObservable();
  
  // UI state
  showFilters = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupReactiveStreams();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todos$'] && this.todos$) {
      this.setupReactiveStreams();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupReactiveStreams(): void {
    // Combine todos with filters and sorting
    this.filteredTodos$ = combineLatest([
      this.todos$.pipe(
        startWith([]),
        catchError(error => {
          console.error('Error loading todos:', error);
          this.snackBar.open('Fehler beim Laden der Todos', 'Schließen', { duration: 3000 });
          return of([]);
        })
      ),
      this.filterSubject.asObservable(),
      this.sortSubject.asObservable()
    ]).pipe(
      map(([todos, filter, sort]) => {
        let filtered = this.applyFilters(todos, filter);
        return this.applySorting(filtered, sort);
      }),
      tap(filtered => {
        // Update pagination length
        const currentPagination = this.paginationSubject.value;
        this.paginationSubject.next({
          ...currentPagination,
          length: filtered.length
        });
      }),
      takeUntil(this.destroy$)
    );

    this.paginatedTodos$ = combineLatest([
      this.filteredTodos$,
      this.paginationSubject.asObservable()
    ]).pipe(
      map(([todos, pagination]) => {
        const startIndex = pagination.pageIndex * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return todos.slice(startIndex, endIndex);
      }),
      takeUntil(this.destroy$)
    );
  }

  private applyFilters(todos: Todo[], filter: TableFilter): Todo[] {
    return todos.filter(todo => {
      // Search filter
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchesSearch = 
          todo.titel.toLowerCase().includes(query) ||
          todo.beschreibung.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filter.status !== 'alle') {
        const isCompleted = filter.status === 'erledigt';
        if (todo.erledigt !== isCompleted) return false;
      }

      // Priority filter
      if (filter.priority !== 'alle') {
        if (todo.priority !== filter.priority) return false;
      }

      return true;
    });
  }

  private applySorting(todos: Todo[], sort: TableSort): Todo[] {
    return [...todos].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.active) {
        case 'titel':
          aValue = a.titel.toLowerCase();
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { niedrig: 1, mittel: 2, hoch: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'erledigt':
          aValue = a.erledigt ? 1 : 0;
          bValue = b.erledigt ? 1 : 0;
          break;
        case 'erstelltAm':
        case 'endeAm':
          const aDate = a[sort.active as keyof Todo];
          const bDate = b[sort.active as keyof Todo];
          aValue = aDate instanceof Date ? aDate.getTime() : new Date(aDate as string | number).getTime();
          bValue = bDate instanceof Date ? bDate.getTime() : new Date(bDate as string | number).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  onSearchChange(event: any): void {
    this.currentFilter.search = event.target.value;
    this.filterSubject.next(this.currentFilter);
  }

  onFilterChange(): void {
    this.filterSubject.next(this.currentFilter);
  }

  onSortChange(sort: Sort): void {
    this.sortSubject.next({
      active: sort.active,
      direction: sort.direction as 'asc' | 'desc'
    });
  }

  onPageChange(event: PageEvent): void {
    this.paginationSubject.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' } as TodoFormData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.create.emit(result);
        this.snackBar.open('Todo erfolgreich erstellt', 'Schließen', { duration: 2000 });
      }
    });
  }

  openEditDialog(todo: Todo): void {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', todo } as TodoFormData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.update.emit({ ...result, id: todo.id });
        this.snackBar.open('Todo erfolgreich aktualisiert', 'Schließen', { duration: 2000 });
      }
    });
  }

  onToggleStatus(todo: Todo): void {
    this.toggle.emit(todo.id);
    const action = todo.erledigt ? 'als offen markiert' : 'als erledigt markiert';
    this.snackBar.open(`Todo "${todo.titel}" wurde ${action}`, 'Schließen', { duration: 2000 });
  }

  onDelete(todo: Todo): void {
    if (confirm(`Möchten Sie das Todo "${todo.titel}" wirklich löschen?`)) {
      this.delete.emit(todo.id);
      this.snackBar.open('Todo erfolgreich gelöscht', 'Schließen', { duration: 2000 });
    }
  }

  refreshData(): void {
    this.loadingSubject.next(true);
    // Simulate loading time
    setTimeout(() => {
      this.loadingSubject.next(false);
      this.snackBar.open('Daten aktualisiert', 'Schließen', { duration: 1500 });
    }, 1000);
  }

  isOverdue(todo: Todo): boolean {
    return !todo.erledigt && new Date(todo.endeAm) < new Date();
  }

  getTruncatedDescription(description: string, maxLength: number = 50): string {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  }

  getPriorityLabel(priority: Priority): string {
    const labels = {
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void {
    this.currentFilter.status = status;
    this.onFilterChange();
  }

  clearSearch(): void {
    this.currentFilter.search = '';
    this.onSearchChange({ target: { value: '' } });
  }

  clearAllFilters(): void {
    this.currentFilter = { search: '', status: 'alle', priority: 'alle' };
    this.onFilterChange();
    this.snackBar.open('Alle Filter wurden zurückgesetzt', 'Schließen', { duration: 2000 });
  }

  hasActiveFilters(): boolean {
    return this.currentFilter.search !== '' || 
           this.currentFilter.status !== 'alle' || 
           this.currentFilter.priority !== 'alle';
  }
}
