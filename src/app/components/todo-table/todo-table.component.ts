// Angular Core Imports
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';

// Local Imports
import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';
import { TableFilter, TableSort, FilterState } from '../../interfaces/todo-interfaces';
import { TodoFilterService } from '../../services/todo-filter.service';
import { TodoUtilsService } from '../../services/todo-utils.service';
import { BASIC_MATERIAL_IMPORTS } from '../../shared/material-imports';


@Component({
  selector: 'app-todo-table',
  standalone: true,
  imports: BASIC_MATERIAL_IMPORTS,
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
  private filterSubject = new BehaviorSubject<FilterState>({          // Filter-State als Stream
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  });
  private sortSubject = new BehaviorSubject<TableSort>({              // Sortier-State als Stream
    active: 'erstelltAm',
    direction: 'desc'
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);       // Loading-State für UI

  // Observable Properties
  currentFilter: TableFilter = { search: '', status: 'alle', priority: 'alle' };  // Aktueller Filter-State (vereinfacht für UI)
  filteredTodos$!: Observable<Todo[]>;                               // Gefilterte Todos als Observable
  isLoading$ = this.loadingSubject.asObservable();                   // Loading-State als Observable
  
  // UI State Properties
  showFilters = false;                                               // Zeigt/versteckt Filter-Panel

  constructor(
    private dialog: MatDialog,                                         // Für Dialog-Öffnung
    private snackBar: MatSnackBar,                                     // Für Benutzer-Feedback
    private filterService: TodoFilterService,                          // Filter-Service
    private utilsService: TodoUtilsService                             // Utils-Service
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
    // Konvertiere TableFilter zu FilterState für den Service
    const filterState: FilterState = {
      search: this.currentFilter.search,
      status: this.currentFilter.status,
      priority: this.currentFilter.priority,
      sortBy: 'erstelltAm',
      sortOrder: 'desc'
    };
    
    const filterState$ = new BehaviorSubject<FilterState>(filterState);

    this.filteredTodos$ = this.filterService.createFilteredTodosStream(
      this.todos$,
      filterState$,
      this.destroy$
    );
  }

  // Diese Methoden wurden in den TodoFilterService ausgelagert

  // Filter Event Handlers
  onSearchChange(event: any): void {                                   // Suchfeld-Änderung
    this.currentFilter.search = event.target.value;                   // Suchbegriff aktualisieren
    this.updateFilterState();                                         // Filter-Stream triggern
  }

  onFilterChange(): void {                                             // Filter-Änderung (Status/Priorität)
    this.updateFilterState();                                         // Filter-Stream triggern
  }

  private updateFilterState(): void {
    const filterState: FilterState = {
      search: this.currentFilter.search,
      status: this.currentFilter.status,
      priority: this.currentFilter.priority,
      sortBy: 'erstelltAm',
      sortOrder: 'desc'
    };
    this.filterSubject.next(filterState);
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
    return this.utilsService.isOverdue(todo);
  }

  getTruncatedDescription(description: string, maxLength: number = 50): string {  // Kürzt Beschreibung ab
    return this.utilsService.getTruncatedDescription(description, maxLength);
  }

  getPriorityLabel(priority: Priority): string {                       // Konvertiert Priorität zu lesbarem Text
    return this.utilsService.getPriorityLabel(priority);
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
