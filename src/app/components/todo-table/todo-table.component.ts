// Angular Core Imports
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
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
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

// RxJS Imports
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
} from 'rxjs';

// Local Imports
import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';

// Interfaces für Filter und Sortierung
export interface TableFilter {
  search: string;                                    // Suchbegriff für Titel/Beschreibung
  status: 'alle' | 'offen' | 'erledigt';           // Status-Filter
  priority: Priority | 'alle';                      // Prioritäts-Filter
}

export interface TableSort {
  active: string;                                    // Spalte nach der sortiert wird
  direction: 'asc' | 'desc';                       // Sortierrichtung
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
    MatSortModule,
    MatMenuModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './todo-table.component.html',
  styleUrls: ['./todo-table.component.css']
})
export class TodoTableComponent implements OnInit, OnDestroy, OnChanges {
  // Input/Output Properties
  @Input() todos$!: Observable<Todo[]>;                              // Observable stream von parent component
  @Output() create = new EventEmitter<Omit<Todo, 'id' | 'erstelltAm'>>();  // Event für neues Todo
  @Output() update = new EventEmitter<Todo>();                       // Event für Todo-Update
  @Output() delete = new EventEmitter<number>();                     // Event für Todo-Löschung
  @Output() toggle = new EventEmitter<number>();                     // Event für Status-Toggle

  // Tabellenspalten Definition
  displayedColumns: string[] = [
    'id', 'titel', 'beschreibung', 'priority', 'erledigt', 'erstelltAm', 'endeAm', 'actions'
  ];

  // RxJS Subjects und Streams
  private destroy$ = new Subject<void>();                              // Für cleanup von subscriptions
  private filterSubject = new BehaviorSubject<TableFilter>({          // Filter-State als Stream
    search: '',
    status: 'alle',
    priority: 'alle'
  });
  private sortSubject = new BehaviorSubject<TableSort>({              // Sortier-State als Stream
    active: 'erstelltAm',
    direction: 'desc'
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);       // Loading-State für UI

  // Observable Properties
  currentFilter: TableFilter = { search: '', status: 'alle', priority: 'alle' };  // Aktueller Filter-State
  filteredTodos$!: Observable<Todo[]>;                               // Gefilterte Todos als Observable
  isLoading$ = this.loadingSubject.asObservable();                   // Loading-State als Observable
  
  // UI State Properties
  showFilters = false;                                               // Zeigt/versteckt Filter-Panel

  constructor(
    private dialog: MatDialog,                                         // Für Dialog-Öffnung
    private snackBar: MatSnackBar                                     // Für Benutzer-Feedback
  ) {}

  ngOnInit(): void {
    this.setupReactiveStreams();                                       // Initiale Stream-Setup
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todos$'] && this.todos$) {                           // Wenn todos$ sich ändert
      this.setupReactiveStreams();                                     // Streams neu setup
    }
  }

  ngOnDestroy(): void {                                               // Cleanup beim Zerstören der Komponente
    this.destroy$.next();                                             // Alle Subscriptions beenden
    this.destroy$.complete();                                         // Subject schließen
  }

  // Reaktive Stream-Setup für gefilterte und sortierte Todos
  private setupReactiveStreams(): void {
    this.filteredTodos$ = combineLatest([                               // Kombiniert mehrere Observables
      this.todos$.pipe(                                                 // Todos-Stream
        startWith([]),                                                  // Start mit leerem Array
        catchError(error => {                                           // Error-Handling
          console.error('Error loading todos:', error);
          this.snackBar.open('Fehler beim Laden der Todos', 'Schließen', { duration: 3000 });
          return of([]);                                                // Bei Fehler: leeres Array
        })
      ),
      this.filterSubject.asObservable(),                               // Filter-Stream
      this.sortSubject.asObservable()                                  // Sortier-Stream
    ]).pipe(
      map(([todos, filter, sort]) => {                                 // Transformiert die kombinierten Daten
        let filtered = this.applyFilters(todos, filter);               // Filtert die Todos
        return this.applySorting(filtered, sort);                      // Sortiert die gefilterten Todos
      }),
      takeUntil(this.destroy$)                                         // Beendet Subscription automatisch
    );
  }

  // Filtert Todos basierend auf Suchkriterien
  private applyFilters(todos: Todo[], filter: TableFilter): Todo[] {
    return todos.filter(todo => {                                       // Geht alle Todos durch
      // Such-Filter: Titel oder Beschreibung
      if (filter.search) {
        const query = filter.search.toLowerCase();                     // Suchbegriff in Kleinbuchstaben
        const matchesSearch = 
          todo.titel.toLowerCase().includes(query) ||                  // Match im Titel?
          todo.beschreibung.toLowerCase().includes(query);             // Match in Beschreibung?
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
  private applySorting(todos: Todo[], sort: TableSort): Todo[] {
    return [...todos].sort((a, b) => {                                // Kopiert Array und sortiert
      let aValue: any, bValue: any;                                   // Vergleichswerte

      switch (sort.active) {                                          // Je nach Spalte unterschiedliche Sortierung
        case 'titel':                                                 // Alphabetische Sortierung
          aValue = a.titel.toLowerCase();                             // Titel in Kleinbuchstaben
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':                                              // Prioritäts-Sortierung (niedrig=1, mittel=2, hoch=3)
          const priorityOrder = { niedrig: 1, mittel: 2, hoch: 3 };
          aValue = priorityOrder[a.priority];                         // Priorität zu Zahl konvertieren
          bValue = priorityOrder[b.priority];
          break;
        case 'erledigt':                                              // Status-Sortierung (false=0, true=1)
          aValue = a.erledigt ? 1 : 0;                               // Boolean zu Zahl konvertieren
          bValue = b.erledigt ? 1 : 0;
          break;
        case 'erstelltAm':
        case 'endeAm':                                                // Datums-Sortierung
          const aDate = a[sort.active as keyof Todo];                // Datum aus Todo holen
          const bDate = b[sort.active as keyof Todo];
          aValue = aDate instanceof Date ? aDate.getTime() : new Date(aDate as string | number).getTime();  // Zu Timestamp konvertieren
          bValue = bDate instanceof Date ? bDate.getTime() : new Date(bDate as string | number).getTime();
          break;
        default:
          return 0;                                                   // Keine Sortierung -> Reihenfolge bleibt
      }

      // Vergleich und Rückgabe der Sortierreihenfolge
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;  // a vor b: asc=-1, desc=1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;  // b vor a: asc=1, desc=-1
      return 0;                                                       // Gleich -> Reihenfolge bleibt
    });
  }

  // Filter Event Handlers
  onSearchChange(event: any): void {                                   // Suchfeld-Änderung
    this.currentFilter.search = event.target.value;                   // Suchbegriff aktualisieren
    this.filterSubject.next(this.currentFilter);                      // Filter-Stream triggern
  }

  onFilterChange(): void {                                             // Filter-Änderung (Status/Priorität)
    this.filterSubject.next(this.currentFilter);                      // Filter-Stream triggern
  }

  onSortChange(sort: Sort): void {                                     // Sortierung-Änderung
    this.sortSubject.next({                                            // Sortier-Stream triggern
      active: sort.active,                                             // Sortier-Spalte
      direction: sort.direction as 'asc' | 'desc'                     // Sortier-Richtung
    });
  }


  // Dialog Event Handlers
  openCreateDialog(): void {                                            // Öffnet Dialog für neues Todo
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {       // Dialog öffnen
      width: '600px',
      data: { mode: 'create' } as TodoFormData                          // Modus: erstellen
    });

    dialogRef.afterClosed().subscribe(result => {                       // Nach Dialog-Schließung
      if (result) {                                                     // Wenn Todo erstellt wurde
        this.create.emit(result);                                       // Create-Event emittieren
        this.snackBar.open('Todo erfolgreich erstellt', 'Schließen', { duration: 2000 });  // Erfolgsmeldung
      }
    });
  }

  openEditDialog(todo: Todo): void {                                    // Öffnet Dialog für Todo-Bearbeitung
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {       // Dialog öffnen
      width: '600px',
      data: { mode: 'edit', todo } as TodoFormData                      // Modus: bearbeiten + Todo-Daten
    });

    dialogRef.afterClosed().subscribe(result => {                       // Nach Dialog-Schließung
      if (result) {                                                     // Wenn Todo bearbeitet wurde
        this.update.emit({ ...result, id: todo.id });                   // Update-Event emittieren (ID beibehalten)
        this.snackBar.open('Todo erfolgreich aktualisiert', 'Schließen', { duration: 2000 });  // Erfolgsmeldung
      }
    });
  }

  // CRUD Event Handlers
  onToggleStatus(todo: Todo): void {                                   // Status-Toggle (erledigt ↔ offen)
    this.toggle.emit(todo.id);                                         // Toggle-Event emittieren
    const action = todo.erledigt ? 'als offen markiert' : 'als erledigt markiert';  // Action-Text für Meldung
    this.snackBar.open(`Todo "${todo.titel}" wurde ${action}`, 'Schließen', { duration: 2000 });  // Status-Änderung melden
  }

  onDelete(todo: Todo): void {                                         // Todo-Löschung
    if (confirm(`Möchten Sie das Todo "${todo.titel}" wirklich löschen?`)) {  // Bestätigung vom Benutzer
      this.delete.emit(todo.id);                                       // Delete-Event emittieren
      this.snackBar.open('Todo erfolgreich gelöscht', 'Schließen', { duration: 2000 });  // Löschung bestätigen
    }
  }

  // Utility Methods
  refreshData(): void {                                                 // Daten-Refresh (simuliert)
    this.loadingSubject.next(true);                                     // Loading-State aktivieren
    setTimeout(() => {                                                  // Simuliert Ladezeit
      this.loadingSubject.next(false);                                  // Loading-State deaktivieren
      this.snackBar.open('Daten aktualisiert', 'Schließen', { duration: 1500 });  // Refresh-Bestätigung
    }, 1000);
  }

  isOverdue(todo: Todo): boolean {                                      // Prüft ob Todo überfällig ist
    return !todo.erledigt && new Date(todo.endeAm) < new Date();       // Nicht erledigt UND Enddatum in Vergangenheit
  }

  getTruncatedDescription(description: string, maxLength: number = 50): string {  // Kürzt Beschreibung ab
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'                    // Zu lang? -> Kürzen + "..."
      : description;                                                   // Kurz genug? -> Original
  }

  getPriorityLabel(priority: Priority): string {                       // Konvertiert Priorität zu lesbarem Text
    const labels = {                                                   // Mapping von Prioritäts-Werten
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];                                           // Lesbarer Text zurückgeben
  }

  // Filter Control Methods
  toggleFilters(): void {                                              // Zeigt/versteckt Filter-Panel
    this.showFilters = !this.showFilters;                             // Filter-Panel umschalten
  }

  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void {      // Setzt Status-Filter
    this.currentFilter.status = status;                               // Status aktualisieren
    this.onFilterChange();                                            // Filter-Stream triggern
  }

  clearSearch(): void {                                               // Löscht Suchfeld
    this.currentFilter.search = '';                                   // Suchbegriff zurücksetzen
    this.onSearchChange({ target: { value: '' } });                  // Suchfeld-Event triggern
  }

  clearAllFilters(): void {                                           // Setzt alle Filter zurück
    this.currentFilter = { search: '', status: 'alle', priority: 'alle' };  // Alle Filter zurücksetzen
    this.onFilterChange();                                            // Filter-Stream triggern
    this.snackBar.open('Alle Filter wurden zurückgesetzt', 'Schließen', { duration: 2000 });  // Bestätigung
  }

  hasActiveFilters(): boolean {                                       // Prüft ob Filter aktiv sind
    return this.currentFilter.search !== '' ||                        // Suchbegriff vorhanden?
           this.currentFilter.status !== 'alle' ||                    // Status-Filter aktiv?
           this.currentFilter.priority !== 'alle';                    // Prioritäts-Filter aktiv?
  }
}
