import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Todo, Priority } from '../../models/todo.model';
import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';
import { FilterState } from '../../interfaces/todo-interfaces';
import { TodoFilterService } from '../../services/todo-filter.service';
import { TodoUtilsService } from '../../services/todo-utils.service';
import { LAYOUT_MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-todo-layout',
  standalone: true,
  imports: LAYOUT_MATERIAL_IMPORTS,
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
    private fb: FormBuilder,
    private filterService: TodoFilterService,
    private utilsService: TodoUtilsService
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
    this.filteredTodos$ = this.filterService.createFilteredTodosStream(
      this.todos$,
      this.filterSubject,
      this.destroy$
    );
  }


  // Diese Methoden wurden in den TodoFilterService ausgelagert

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
    this.currentFilter = this.filterService.getDefaultFilter(); //Setzt alle filter zurück
    this.onFilterChange();                      //triggert update
  }
  hasActiveFilters(): boolean {                //Prüft ob suche, status oder priority filter aktiv sind
    return this.filterService.hasActiveFilters(this.currentFilter);
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
    return this.utilsService.getPriorityLabel(priority);
  }

  //Prüft ob Enddatum in der Vergangenheit liegt
  isOverdue(todo: Todo): boolean { 
    return this.utilsService.isOverdue(todo);
  }
}
