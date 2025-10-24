import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, map, takeUntil, Subject, of, catchError, startWith, debounceTime } from 'rxjs';
import { Todo, Priority } from '../models/todo.model';

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
export class TodoFilterService {
  
  /**
   * Filtert Todos basierend auf Suchkriterien
   */
  applyFilters(todos: Todo[], filter: FilterState): Todo[] {
    return todos.filter(todo => {
      // Such-Filter: Titel, Beschreibung oder ID
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchesSearch = 
          todo.titel.toLowerCase().includes(query) ||
          todo.beschreibung.toLowerCase().includes(query) ||
          todo.id.toString().includes(query);
        if (!matchesSearch) return false;
      }

      // Status-Filter: Offen oder Erledigt
      if (filter.status !== 'alle') {
        const isCompleted = filter.status === 'erledigt';
        if (todo.erledigt !== isCompleted) return false;
      }

      // Prioritäts-Filter: Niedrig, Mittel oder Hoch
      if (filter.priority !== 'alle') {
        if (todo.priority !== filter.priority) return false;
      }

      return true;
    });
  }

  /**
   * Sortiert Todos basierend auf gewählter Spalte und Richtung
   */
  applySorting(todos: Todo[], filter: FilterState): Todo[] {
    return [...todos].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filter.sortBy) {
        case 'titel':
          aValue = a.titel.toLowerCase();
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { niedrig: 1, mittel: 2, hoch: 3 } as const;
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
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

  /**
   * Erstellt einen reaktiven Stream für gefilterte und sortierte Todos
   */
  createFilteredTodosStream(
    todos$: Observable<Todo[]>,
    filterSubject: BehaviorSubject<FilterState>,
    destroy$: Subject<void>
  ): Observable<Todo[]> {
    return combineLatest([
      todos$.pipe(
        startWith([]),
        catchError(error => {
          console.error('Error loading todos:', error);
          return of([]);
        })
      ),
      filterSubject.asObservable().pipe(
        debounceTime(300)
      )
    ]).pipe(
      map(([todos, filter]) => {
        let filtered = this.applyFilters(todos, filter);
        return this.applySorting(filtered, filter);
      }),
      takeUntil(destroy$)
    );
  }

  /**
   * Prüft ob aktive Filter gesetzt sind
   */
  hasActiveFilters(filter: FilterState): boolean {
    return filter.search !== '' || 
           filter.status !== 'alle' || 
           filter.priority !== 'alle';
  }

  /**
   * Setzt alle Filter zurück
   */
  getDefaultFilter(): FilterState {
    return {
      search: '',
      status: 'alle',
      priority: 'alle',
      sortBy: 'erstelltAm',
      sortOrder: 'desc'
    };
  }
}