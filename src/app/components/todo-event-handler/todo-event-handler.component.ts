import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';

export interface FilterState {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class TodoEventHandler {
  // Event emitters for parent components
  private createSubject = new Subject<Omit<Todo, 'id' | 'erstelltAm'>>();
  private updateSubject = new Subject<Todo>();
  private deleteSubject = new Subject<number>();
  private toggleSubject = new Subject<number>();
  private filterSubject = new BehaviorSubject<FilterState>({
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  });

  // Public observables for components to subscribe to
  public create$ = this.createSubject.asObservable();
  public update$ = this.updateSubject.asObservable();
  public delete$ = this.deleteSubject.asObservable();
  public toggle$ = this.toggleSubject.asObservable();
  public filter$ = this.filterSubject.asObservable();

  // Current filter state
  public currentFilter: FilterState = {
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  };

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  // Filter Event Handlers
  onSearchChange(event: any): void {
    this.currentFilter.search = event.target.value;
    this.filterSubject.next(this.currentFilter);
  }

  onFilterChange(): void {
    this.filterSubject.next(this.currentFilter);
  }

  onSortChange(sort: { active: string; direction: 'asc' | 'desc' }): void {
    this.currentFilter.sortBy = sort.active as FilterState['sortBy'];
    this.currentFilter.sortOrder = sort.direction;
    this.filterSubject.next(this.currentFilter);
  }

  // Dialog Event Handlers
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' } as TodoFormData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createSubject.next(result);
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
        this.updateSubject.next({ ...result, id: todo.id });
        this.snackBar.open('Todo erfolgreich aktualisiert', 'Schließen', { duration: 2000 });
      }
    });
  }

  // CRUD Event Handlers
  onToggleStatus(todo: Todo): void {
    this.toggleSubject.next(todo.id);
    const action = todo.erledigt ? 'als offen markiert' : 'als erledigt markiert';
    this.snackBar.open(`Todo "${todo.titel}" wurde ${action}`, 'Schließen', { duration: 2000 });
  }

  onDelete(todo: Todo): void {
    if (confirm(`Möchten Sie das Todo "${todo.titel}" wirklich löschen?`)) {
      this.deleteSubject.next(todo.id);
      this.snackBar.open('Todo erfolgreich gelöscht', 'Schließen', { duration: 2000 });
    }
  }

  // Direct CRUD methods for simple operations
  handleCreate(todoData: Omit<Todo, 'id' | 'erstelltAm'>): void {
    this.createSubject.next(todoData);
  }

  handleUpdate(todo: Todo): void {
    this.updateSubject.next(todo);
  }

  handleToggle(id: number): void {
    this.toggleSubject.next(id);
  }

  handleDelete(id: number): void {
    this.deleteSubject.next(id);
  }

  // Utility Methods
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

  // Filter Control Methods
  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void {
    this.currentFilter.status = status;
    this.onFilterChange();
  }

  setPriorityFilter(priority: Priority | 'alle'): void {
    this.currentFilter.priority = priority;
    this.onFilterChange();
  }

  setSort(sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): void {
    this.currentFilter.sortBy = sortBy;
    this.currentFilter.sortOrder = sortOrder;
    this.onFilterChange();
  }

  clearSearch(): void {
    this.currentFilter.search = '';
    this.onSearchChange({ target: { value: '' } });
  }

  clearAllFilters(): void {
    this.currentFilter = { 
      search: '', 
      status: 'alle', 
      priority: 'alle', 
      sortBy: 'erstelltAm', 
      sortOrder: 'desc' 
    };
    this.onFilterChange();
    this.snackBar.open('Alle Filter wurden zurückgesetzt', 'Schließen', { duration: 2000 });
  }

  hasActiveFilters(): boolean {
    return this.currentFilter.search !== '' || 
           this.currentFilter.status !== 'alle' || 
           this.currentFilter.priority !== 'alle';
  }
}
