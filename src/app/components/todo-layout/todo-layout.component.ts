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
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
  debounceTime
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
    ReactiveFormsModule,
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
    MatNativeDateModule,
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
  todoForm!: FormGroup;
  isCreatingNew = false;

  

  // filter und sortierungs zustand 
  currentFilter: FilterState = {
    search: '',
    status: 'alle',
    priority: 'alle',
    sortBy: 'erstelltAm',
    sortOrder: 'desc'
  };

  // subjects für verschiedenene states (filter, ui state etc...)
  private destroy$ = new Subject<void>();                                             //Um subscriptions zu beenden
  private filterSubject = new BehaviorSubject<FilterState>(this.currentFilter);       //liefert filter zustand als stream
  filteredTodos$!: Observable<Todo[]>;                                                //liefert gefilterte todos
  isLoading$ = new BehaviorSubject<boolean>(false);                                   //ui zustand; true = lädt, false = fertig


  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setupReactiveStreams();  //initial hook für streams
    this.initForm();
  }

  initForm() {
    // Set default date to one week from today
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
    
    this.todoForm = this.fb.group({
      titel: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      priority: ['niedrig', Validators.required],
      endeAm: [oneWeekFromToday, [Validators.required, this.futureDateValidator]],
      beschreibung: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  /**
   * Custom validator to ensure due date is in the future
   */
  private futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }

  ngOnDestroy(): void {           //hook wenn komponente zerstört wird, memory leaks verhindern
    this.destroy$.next();         //
    this.destroy$.complete();     //beendet das subject
  }

  //reaktiver dataflow für gefilterte und sortierte todos
  private setupReactiveStreams(): void { 
    this.filteredTodos$ = combineLatest([                 //kombiniert mehrere observable immer wenn neue werte geliefert werden
      this.todos$.pipe(                                   //holt sich die todo liste
        startWith([]),                                    //start mit empty array
        catchError(error => {                             //error handling mit console log und snackbar
          console.error('Error loading todos:', error);
          this.snackBar.open('Fehler beim Laden der Todos, mehr Infos in der Konsole', 'Schließen', { duration: 3000 });
          return of([]);                                  //return empty array bei fehler
        })
      ),
      this.filterSubject.asObservable().pipe(
        debounceTime(300)                                 //debounce für filter (speziell für suche alle 300ms)
      )                 
    ]).pipe(
      map(([todos, filter]) => {                          //holt sich die todos
        let filtered = this.applyFilters(todos, filter);  //filtert die liste
        return this.applySorting(filtered, filter);       //sortiert die gefilterte liste
      }),
      takeUntil(this.destroy$)                             //beendet subscription automatisch, normal void
    );
  }


  //gibt gefiltertes array aus
  private applyFilters(todos: Todo[], filter: FilterState): Todo[] {
    return todos.filter(todo => {                                           //geht alle todos durch und filtert alle mit false aus
      if (filter.search) {
        const q = filter.search.toLowerCase();                              //suchbegriff in kleinbuchstaben
        const matches = todo.titel.toLowerCase().includes(q) ||             //match mit q?
                        todo.beschreibung.toLowerCase().includes(q) ||
                        todo.id.toString().includes(q);
        if (!matches) return false;                                         //nicht mit q? -> false
      }
      if (filter.status !== 'alle') {                                       //status filter
        const isCompleted = filter.status === 'erledigt';
        if (todo.erledigt !== isCompleted) return false;                    //todo falscher status? -> false
      }
      if (filter.priority !== 'alle') {                                     //priority filter
        if (todo.priority !== filter.priority) return false;                //todo falsche prio? -> false
      }
      return true;                                                          //passt alles? -> true
    });
  }

  //gibt sortiertes array aus
  private applySorting(todos: Todo[], filter: FilterState): Todo[] {
    if(filter.search === '') //debug
    {
          console.log("Order: "+ filter.sortOrder + " Prio: " + filter.priority + " Suche: Leer" + " Status: " + filter.status);
    }
    else {
      console.log("Order: "+ filter.sortOrder + " Prio: " + filter.priority + " Suche: " + filter.search + " Status: " + filter.status);
    }
    return [...todos].sort((a, b) => {                                      //kopiert todo liste und vergleicht
      let aValue: any, bValue: any;
      switch (filter.sortBy) {
        case 'titel':                                                       //sortiert nach titel alphabetisch unabhängig von groß klein buchstaben
          aValue = a.titel.toLowerCase();
          bValue = b.titel.toLowerCase();
          break;
        case 'priority':                                                    //sortiert nach priorität nach zahlen und vergleicht
          const order = { niedrig: 1, mittel: 2, hoch: 3 } as const;
          aValue = order[a.priority];
          bValue = order[b.priority];
          break;
        case 'erstelltAm':
        case 'endeAm':                                                      //sortiert nach date (wandelt zuerst in zahl um)
          aValue = new Date(a[filter.sortBy]).getTime();
          bValue = new Date(b[filter.sortBy]).getTime();
          break;
        default:
          return 0;                                                         //kein sortieren, gibt todo unverändert aus
      }
      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;      //-1: a kommt vor b - 1: b kommt vor a, 0: reihenfolge bleibt gleich
      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;      //asc oder desc
      return 0;
    });
  }

  // Filter handlers
  onSearchChange(event: any): void {           //Suchleisten eingabe, pusht neuen filter in filterSubject
    this.currentFilter.search = event.target.value; 
    this.filterSubject.next(this.currentFilter); 
  }
  onFilterChange(): void {                     //Updated filter bei Änderungen
    this.filterSubject.next(this.currentFilter); 
  }
  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void { 
    this.currentFilter.status = status;        //setzt status filter
    this.onFilterChange();                     //updated liste
  }
  setSort(sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): void { 
    this.currentFilter.sortBy = sortBy;        //sortierfeld
    this.currentFilter.sortOrder = sortOrder;  //sortierreiehenfolge
    this.onFilterChange(); 
  }
  clearSearch(): void {                        //Sucheingabe löschen
    this.currentFilter.search = '';            //löscht suchfeldtext
    this.onSearchChange({ target: { value: '' } }); //triggert neue filterung nach ''
  }
  clearAllFilters(): void {                    //Zurücksetzen
    this.currentFilter = { search: '', status: 'alle', priority: 'alle', sortBy: 'erstelltAm', sortOrder: 'desc' }; //Setzt alle filter zurück
    this.onFilterChange();                      //triggert update
  }
  hasActiveFilters(): boolean {                //Prüft ob suche, status oder priority filter aktiv sind
    return this.currentFilter.search !== '' || 
    this.currentFilter.status !== 'alle' || 
    this.currentFilter.priority !== 'alle'; 
  }

  // Bearbeitungsdialog
  openEditDialog(todo: Todo): void {          
    const dialogRef = this.dialog.open(TodoFormDialogComponent, { width: '600px', data: { mode: 'edit', todo } as TodoFormData });      //Öffnet Dialog für Todo
    dialogRef.afterClosed().subscribe(result => { if (result) { this.update.emit(result);                                               //Wenn geschlossen und ergebnis kommt, update event
      this.snackBar.open('Todo aktualisiert', 'Schließen', { duration: 2000 }); } });                                                   //snackbar mit erfolgsnachricht
  }

  // CRUD Event Handlers
  onUpdate(todo: Todo): void { this.update.emit(todo); }                                                                  //emit bei update
  onDelete(id: number): void { if (confirm('Möchten Sie dieses Todo wirklich löschen?')) { this.delete.emit(id); } }      //bestätigung vom nutzer und emit bei delete
  onToggle(id: number): void { this.toggle.emit(id); }                                                                    //toggle von status und emit

  // Neues Todo erstellen
  startCreatingNew(): void { 
    this.isCreatingNew = true; 
    // Set default date to one week from today
    const oneWeekFromToday = new Date();
    oneWeekFromToday.setDate(oneWeekFromToday.getDate() + 7);
    
    this.todoForm.reset({
      titel: '',
      beschreibung: '',
      priority: 'niedrig',
      endeAm: oneWeekFromToday
    });
    }

  cancelCreatingNew(): void { 
    this.isCreatingNew = false; 
    this.todoForm.reset({
      titel: '',
      beschreibung: '',
      priority: 'niedrig',
      endeAm: ''
    });
    }

  //Speichern von Todo
  saveNewTodo(): void { 
    if (this.todoForm.valid) {                                              //Validierungscheck
      const formValue = this.todoForm.value;
      this.create.emit({
        titel: formValue.titel,
        beschreibung: formValue.beschreibung,
        priority: formValue.priority,
        endeAm: formValue.endeAm,
        erledigt: false
      });      //create Event emit
      this.cancelCreatingNew();                                               //Forumlar schließen
      this.snackBar.open('Todo erstellt', 'Schließen', { duration: 2000 });   //Snackbar bestätigung
    } else {
      this.logValidationErrors();
      this.snackBar.open('Bitte korrigieren Sie die Eingabefehler', 'Schließen', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  //Validierung
  isNewTodoValid(): boolean { 
    return this.todoForm.valid;
  }

  /**
   * Logs detailed validation errors for debugging
   */
  private logValidationErrors(): void {
    const errors: any = {};
    
    Object.keys(this.todoForm.controls).forEach(key => {
      const control = this.todoForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });

    console.error('Todo form validation errors:', {
      errors,
      formValue: this.todoForm.value,
      timestamp: new Date().toISOString()
    });
  }

  //Umwandlung priority namen
  getPriorityLabel(priority: Priority): string { 
    const labels = { 
      niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' 
    }; 
    return labels[priority]; 
  }

  //Prüft ob Enddatum in der Vergangenheit liegt
  isOverdue(todo: Todo): boolean { 
    return !todo.erledigt &&              //Todo erledigt?
    new Date(todo.endeAm) < new Date();   //Datum in der Vergangenheit?
  }
}
