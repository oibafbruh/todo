// Angular Core Imports
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, Subject, takeUntil, catchError, startWith, of } from 'rxjs';

// Local Imports
import { Todo, Priority } from '../models/todo.model';

// Filter and Sort Interfaces
export interface FilterState {
  search: string;                                    // Suchbegriff für Titel/Beschreibung
  status: 'alle' | 'offen' | 'erledigt';           // Status-Filter
  priority: Priority | 'alle';                      // Prioritäts-Filter
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';  // Sortierfeld
  sortOrder: 'asc' | 'desc';                       // Sortierrichtung
}

@Injectable({
  providedIn: 'root'
})
export class TodoFilterService {
  // RxJS Subjects für Filter- und Sortier-State
  private filterSubject = new BehaviorSubject<FilterState>({
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  });

  // Public Observable für Filter-State
  filterState$ = this.filterSubject.asObservable();

  // Getter für aktuellen Filter-State
  get currentFilter(): FilterState {
    return this.filterSubject.getValue();
  }

  // Setter für Filter-State
  setFilterState(filter: Partial<FilterState>): void {
    const currentFilter = this.currentFilter;
    this.filterSubject.next({ ...currentFilter, ...filter });
  }

  // Erstellt gefilterte und sortierte Todos als Observable
  getFilteredTodos(todos$: Observable<Todo[]>): Observable<Todo[]> {
    return combineLatest([
      todos$.pipe(
        startWith([]),
        catchError(error => {
          console.error('Error loading todos:', error);
          return of([]);
        })
      ),
      this.filterState$
    ]).pipe(
      map(([todos, filter]) => {
        let filtered = this.applyFilters(todos, filter);
        return this.applySorting(filtered, filter);
      })
    );
  }

  // Filtert Todos basierend auf Suchkriterien
  private applyFilters(todos: Todo[], filter: FilterState): Todo[] {
    return todos.filter(todo => {                                      // Geht alle Todos durch
      // Such-Filter: Titel oder Beschreibung
      if (filter.search) {
        const query = filter.search.toLowerCase();                     // Suchbegriff in Kleinbuchstaben
        const matchesSearch = 
          todo.titel.toLowerCase().includes(query) ||                  // Match im Titel?
          todo.beschreibung.toLowerCase().includes(query) ||           // Match in Beschreibung?
          todo.id.toString().includes(query);                          // Match in ID?
        if (!matchesSearch) return false;                              // Kein Match? -> Todo ausschließen
      }

      // Status-Filter: Offen oder Erledigt
      if (filter.status !== 'alle') {
        const isCompleted = filter.status === 'erledigt';              // Gesuchter Status
        if (todo.erledigt !== isCompleted) return false;               // Falscher Status? -> Todo ausschließen
      }

      // Prioritäts-Filter: Niedrig, Mittel oder Hoch
      if (filter.priority !== 'alle') {
        if (todo.priority !== filter.priority) return false;           // Falsche Priorität? -> Todo ausschließen
      }

      return true;                                                     // Alle Filter bestanden? -> Todo behalten
    });
  }

  // Sortiert Todos basierend auf gewählter Spalte und Richtung
  private applySorting(todos: Todo[], filter: FilterState): Todo[] {
    return [...todos].sort((a, b) => {                                  // Kopiert Array und sortiert
      let aValue: any, bValue: any;                                     // Vergleichswerte

      switch (filter.sortBy) {                                          // Je nach Spalte unterschiedliche Sortierung
        case 'titel':                                                   // Alphabetische Sortierung
          aValue = a.titel.toLowerCase();                               // Titel in Kleinbuchstaben
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':                                                // Prioritäts-Sortierung (niedrig=1, mittel=2, hoch=3)
          const priorityOrder = { niedrig: 1, mittel: 2, hoch: 3 };
          aValue = priorityOrder[a.priority];                           // Priorität zu Zahl konvertieren
          bValue = priorityOrder[b.priority];
          break;
        case 'erstelltAm':
        case 'endeAm':                                                  // Datums-Sortierung
          aValue = new Date(a[filter.sortBy]).getTime();                // Datum zu Timestamp konvertieren
          bValue = new Date(b[filter.sortBy]).getTime();
          break;
        default:
          return 0;                                                     // Keine Sortierung -> Reihenfolge bleibt
      }

      // Vergleich und Rückgabe der Sortierreihenfolge
      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;  // a vor b: asc=-1, desc=1
      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;  // b vor a: asc=1, desc=-1
      return 0;                                                         // Gleich -> Reihenfolge bleibt
    });
  }

  // Filter Event Handlers
  updateSearch(search: string): void {                                  // Suchfeld-Änderung
    this.setFilterState({ search });                                    // Suchbegriff aktualisieren
  }

  updateStatus(status: 'alle' | 'offen' | 'erledigt'): void {           // Status-Filter-Änderung
    this.setFilterState({ status });                                    // Status aktualisieren
  }

  updatePriority(priority: Priority | 'alle'): void {                   // Prioritäts-Filter-Änderung
    this.setFilterState({ priority });                                  // Priorität aktualisieren
  }

  updateSorting(sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): void {  // Sortierung-Änderung
    this.setFilterState({ sortBy, sortOrder });                         // Sortierung aktualisieren
  }

  // Filter Control Methods
  clearSearch(): void {                                                 // Löscht Suchfeldtext
      this.setFilterState({ search: '' });                              // Suchbegriff zurücksetzen
    }

  clearAllFilters(): void {                                             // Setzt alle Filter zurück
    this.setFilterState({                                               // Alle Filter zurücksetzen
      search: '',
      status: 'alle',
      priority: 'alle',
      sortBy: 'erstelltAm',
      sortOrder: 'desc'
    });
  }

  hasActiveFilters(): boolean {                                       // Prüft ob Filter aktiv sind
    const filter = this.currentFilter;
    return filter.search !== '' ||                                    // Suchbegriff vorhanden?
           filter.status !== 'alle' ||                                // Status-Filter aktiv?
           filter.priority !== 'alle';                                // Prioritäts-Filter aktiv?
  }

  // Utility Methods
  getPriorityLabel(priority: Priority): string {                      // Konvertiert Priorität zu lesbarem Text
    const labels = {                                                  // Mapping von Prioritäts-Werten
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];                                          // Lesbarer Text zurückgeben
  }

  isOverdue(todo: Todo): boolean {                                    // Prüft ob Todo überfällig ist
    return !todo.erledigt && new Date(todo.endeAm) < new Date();       // Nicht erledigt UND Enddatum in Vergangenheit
  }

  getTruncatedDescription(description: string, maxLength: number = 50): string {  // Kürzt Beschreibung ab
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'                    // Zu lang? -> Kürzen + "..."
      : description;                                                   // Kurz genug? -> Original
  }
}
