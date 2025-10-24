[33mcommit 26daab658db7ae390d2199e5694514302c058124[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Fabio Bauer <fabio.bauer@verwaltungsmanagement.at>
Date:   Fri Oct 24 09:31:25 2025 +0200

    Restrukturierung

[1mdiff --git a/src/app/app.routes.server.ts b/src/app/app.routes.server.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..ffd37b1[m
[1m--- /dev/null[m
[1m+++ b/src/app/app.routes.server.ts[m
[36m@@ -0,0 +1,8 @@[m
[32m+[m[32mimport { RenderMode, ServerRoute } from '@angular/ssr';[m
[32m+[m
[32m+[m[32mexport const serverRoutes: ServerRoute[] = [[m
[32m+[m[32m  {[m
[32m+[m[32m    path: '**',[m
[32m+[m[32m    renderMode: RenderMode.Prerender[m
[32m+[m[32m  }[m
[32m+[m[32m];[m
[1mdiff --git a/src/app/app.routes.ts b/src/app/app.routes.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..dc39edb[m
[1m--- /dev/null[m
[1m+++ b/src/app/app.routes.ts[m
[36m@@ -0,0 +1,3 @@[m
[32m+[m[32mimport { Routes } from '@angular/router';[m
[32m+[m
[32m+[m[32mexport const routes: Routes = [];[m
[1mdiff --git a/src/app/components/todo-event-handler/todo-event-handler.component.ts b/src/app/components/todo-event-handler/todo-event-handler.component.ts[m
[1mnew file mode 100644[m
[1mindex 0000000..d363737[m
[1m--- /dev/null[m
[1m+++ b/src/app/components/todo-event-handler/todo-event-handler.component.ts[m
[36m@@ -0,0 +1,189 @@[m
[32m+[m[32mimport { Injectable } from '@angular/core';[m
[32m+[m[32mimport { MatDialog } from '@angular/material/dialog';[m
[32m+[m[32mimport { MatSnackBar } from '@angular/material/snack-bar';[m
[32m+[m[32mimport { Observable, Subject, BehaviorSubject } from 'rxjs';[m
[32m+[m[32mimport { Todo, Priority } from '../../models/todo.model';[m
[32m+[m[32mimport { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';[m
[32m+[m
[32m+[m[32mexport interface FilterState {[m
[32m+[m[32m  search: string;[m
[32m+[m[32m  status: 'alle' | 'offen' | 'erledigt';[m
[32m+[m[32m  priority: Priority | 'alle';[m
[32m+[m[32m  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';[m
[32m+[m[32m  sortOrder: 'asc' | 'desc';[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m@Injectable({[m
[32m+[m[32m  providedIn: 'root'[m
[32m+[m[32m})[m
[32m+[m[32mexport class TodoEventHandler {[m
[32m+[m[32m  // Event emitters for parent components[m
[32m+[m[32m  private createSubject = new Subject<Omit<Todo, 'id' | 'erstelltAm'>>();[m
[32m+[m[32m  private updateSubject = new Subject<Todo>();[m
[32m+[m[32m  private deleteSubject = new Subject<number>();[m
[32m+[m[32m  private toggleSubject = new Subject<number>();[m
[32m+[m[32m  private filterSubject = new BehaviorSubject<FilterState>({[m
[32m+[m[32m    search: '',[m
[32m+[m[32m    status: 'alle',[m
[32m+[m[32m    priority: 'alle',[m
[32m+[m[32m    sortBy: 'erstelltAm',[m
[32m+[m[32m    sortOrder: 'desc'[m
[32m+[m[32m  });[m
[32m+[m
[32m+[m[32m  // Public observables for components to subscribe to[m
[32m+[m[32m  public create$ = this.createSubject.asObservable();[m
[32m+[m[32m  public update$ = this.updateSubject.asObservable();[m
[32m+[m[32m  public delete$ = this.deleteSubject.asObservable();[m
[32m+[m[32m  public toggle$ = this.toggleSubject.asObservable();[m
[32m+[m[32m  public filter$ = this.filterSubject.asObservable();[m
[32m+[m
[32m+[m[32m  // Current filter state[m
[32m+[m[32m  public currentFilter: FilterState = {[m
[32m+[m[32m    search: '',[m
[32m+[m[32m    status: 'alle',[m
[32m+[m[32m    priority: 'alle',[m
[32m+[m[32m    sortBy: 'erstelltAm',[m
[32m+[m[32m    sortOrder: 'desc'[m
[32m+[m[32m  };[m
[32m+[m
[32m+[m[32m  constructor([m
[32m+[m[32m    private dialog: MatDialog,[m
[32m+[m[32m    private snackBar: MatSnackBar[m
[32m+[m[32m  ) {}[m
[32m+[m
[32m+[m[32m  // Filter Event Handlers[m
[32m+[m[32m  onSearchChange(event: any): void {[m
[32m+[m[32m    this.currentFilter.search = event.target.value;[m
[32m+[m[32m    this.filterSubject.next(this.currentFilter);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  onFilterChange(): void {[m
[32m+[m[32m    this.filterSubject.next(this.currentFilter);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  onSortChange(sort: { active: string; direction: 'asc' | 'desc' }): void {[m
[32m+[m[32m    this.currentFilter.sortBy = sort.active as FilterState['sortBy'];[m
[32m+[m[32m    this.currentFilter.sortOrder = sort.direction;[m
[32m+[m[32m    this.filterSubject.next(this.currentFilter);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // Dialog Event Handlers[m
[32m+[m[32m  openCreateDialog(): void {[m
[32m+[m[32m    const dialogRef = this.dialog.open(TodoFormDialogComponent, {[m
[32m+[m[32m      width: '600px',[m
[32m+[m[32m      data: { mode: 'create' } as TodoFormData[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    dialogRef.afterClosed().subscribe(result => {[m
[32m+[m[32m      if (result) {[m
[32m+[m[32m        this.createSubject.next(result);[m
[32m+[m[32m        this.snackBar.open('Todo erfolgreich erstellt', 'Schließen', { duration: 2000 });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  openEditDialog(todo: Todo): void {[m
[32m+[m[32m    const dialogRef = this.dialog.open(TodoFormDialogComponent, {[m
[32m+[m[32m      width: '600px',[m
[32m+[m[32m      data: { mode: 'edit', todo } as TodoFormData[m
[32m+[m[32m    });[m
[32m+[m
[32m+[m[32m    dialogRef.afterClosed().subscribe(result => {[m
[32m+[m[32m      if (result) {[m
[32m+[m[32m        this.updateSubject.next({ ...result, id: todo.id });[m
[32m+[m[32m        this.snackBar.open('Todo erfolgreich aktualisiert', 'Schließen', { duration: 2000 });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // CRUD Event Handlers[m
[32m+[m[32m  onToggleStatus(todo: Todo): void {[m
[32m+[m[32m    this.toggleSubject.next(todo.id);[m
[32m+[m[32m    const action = todo.erledigt ? 'als offen markiert' : 'als erledigt markiert';[m
[32m+[m[32m    this.snackBar.open(`Todo "${todo.titel}" wurde ${action}`, 'Schließen', { duration: 2000 });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  onDelete(todo: Todo): void {[m
[32m+[m[32m    if (confirm(`Möchten Sie das Todo "${todo.titel}" wirklich löschen?`)) {[m
[32m+[m[32m      this.deleteSubject.next(todo.id);[m
[32m+[m[32m      this.snackBar.open('Todo erfolgreich gelöscht', 'Schließen', { duration: 2000 });[m
[32m+[m[32m    }[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // Direct CRUD methods for simple operations[m
[32m+[m[32m  handleCreate(todoData: Omit<Todo, 'id' | 'erstelltAm'>): void {[m
[32m+[m[32m    this.createSubject.next(todoData);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  handleUpdate(todo: Todo): void {[m
[32m+[m[32m    this.updateSubject.next(todo);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  handleToggle(id: number): void {[m
[32m+[m[32m    this.toggleSubject.next(id);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  handleDelete(id: number): void {[m
[32m+[m[32m    this.deleteSubject.next(id);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // Utility Methods[m
[32m+[m[32m  isOverdue(todo: Todo): boolean {[m
[32m+[m[32m    return !todo.erledigt && new Date(todo.endeAm) < new Date();[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  getTruncatedDescription(description: string, maxLength: number = 50): string {[m
[32m+[m[32m    return description.length > maxLength[m[41m [m
[32m+[m[32m      ? description.substring(0, maxLength) + '...'[m
[32m+[m[32m      : description;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  getPriorityLabel(priority: Priority): string {[m
[32m+[m[32m    const labels = {[m
[32m+[m[32m      niedrig: 'Niedrig',[m
[32m+[m[32m      mittel: 'Mittel',[m
[32m+[m[32m      hoch: 'Hoch'[m
[32m+[m[32m    };[m
[32m+[m[32m    return labels[priority];[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  // Filter Control Methods[m
[32m+[m[32m  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void {[m
[32m+[m[32m    this.currentFilter.status = status;[m
[32m+[m[32m    this.onFilterChange();[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  setPriorityFilter(priority: Priority | 'alle'): void {[m
[32m+[m[32m    this.currentFilter.priority = priority;[m
[32m+[m[32m    this.onFilterChange();[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  setSort(sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']): void {[m
[32m+[m[32m    this.currentFilter.sortBy = sortBy;[m
[32m+[m[32m    this.currentFilter.sortOrder = sortOrder;[m
[32m+[m[32m    this.onFilterChange();[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  clearSearch(): void {[m
[32m+[m[32m    this.currentFilter.search = '';[m
[32m+[m[32m    this.onSearchChange({ target: { value: '' } });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  clearAllFilters(): void {[m
[32m+[m[32m    this.currentFilter = {[m[41m [m
[32m+[m[32m      search: '',[m[41m [m
[32m+[m[32m      status: 'alle',[m[41m [m
[32m+[m[32m      priority: 'alle',[m[41m [m
[32m+[m[32m      sortBy: 'erstelltAm',[m[41m [m
[32m+[m[32m      sortOrder: 'desc'[m[41m [m
[32m+[m[32m    };[m
[32m+[m[32m    this.onFilterChange();[m
[32m+[m[32m    this.snackBar.open('Alle Filter wurden zurückgesetzt', 'Schließen', { duration: 2000 });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  hasActiveFilters(): boolean {[m
[32m+[m[32m    return this.currentFilter.search !== '' ||[m[41m [m
[32m+[m[32m           this.currentFilter.status !== 'alle' ||[m[41m [m
[32m+[m[32m           this.currentFilter.priority !== 'alle';[m
[32m+[m[32m  }[m
[32m+[m[32m}[m
[1mdiff --git a/src/app/components/todo-layout/todo-layout.component.ts b/src/app/components/todo-layout/todo-layout.component.ts[m
[1mindex 24cb0d3..b90d762 100644[m
[1m--- a/src/app/components/todo-layout/todo-layout.component.ts[m
[1m+++ b/src/app/components/todo-layout/todo-layout.component.ts[m
[36m@@ -1,74 +1,20 @@[m
 import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';[m
[31m-import { CommonModule } from '@angular/common';[m
[31m-import { MatToolbarModule } from '@angular/material/toolbar';[m
[31m-import { MatButtonModule } from '@angular/material/button';[m
[31m-import { MatIconModule } from '@angular/material/icon';[m
[31m-import { MatFormFieldModule } from '@angular/material/form-field';[m
[31m-import { MatInputModule } from '@angular/material/input';[m
[31m-import { MatSelectModule } from '@angular/material/select';[m
[31m-import { MatChipsModule } from '@angular/material/chips';[m
[31m-import { MatMenuModule } from '@angular/material/menu';[m
[31m-import { MatTooltipModule } from '@angular/material/tooltip';[m
[31m-import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';[m
[31m-import { MatDialogModule, MatDialog } from '@angular/material/dialog';[m
[31m-import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';[m
[31m-import { MatCardModule } from '@angular/material/card';[m
[31m-import { MatDividerModule } from '@angular/material/divider';[m
[31m-import { MatTableModule } from '@angular/material/table';[m
[31m-import { MatCheckboxModule } from '@angular/material/checkbox';[m
[31m-import { MatDatepickerModule } from '@angular/material/datepicker';[m
[31m-import { MatNativeDateModule } from '@angular/material/core';[m
[31m-import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';[m
[31m-import { [m
[31m-  BehaviorSubject, [m
[31m-  combineLatest, [m
[31m-  map, [m
[31m-  Subject, [m
[31m-  takeUntil, [m
[31m-  Observable, [m
[31m-  of, [m
[31m-  catchError,[m
[31m-  startWith,[m
[31m-  debounceTime[m
[31m-} from 'rxjs';[m
[32m+[m[32mimport { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';[m
[32m+[m[32mimport { BehaviorSubject, Subject, Observable } from 'rxjs';[m
[32m+[m[32mimport { MatSnackBar } from '@angular/material/snack-bar';[m
[32m+[m[32mimport { MatDialog } from '@angular/material/dialog';[m
 [m
 import { Todo, Priority } from '../../models/todo.model';[m
 import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';[m
[31m-[m
[31m-export interface FilterState {[m
[31m-  search: string;[m
[31m-  status: 'alle' | 'offen' | 'erledigt';[m
[31m-  priority: Priority | 'alle';[m
[31m-  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';[m
[31m-  sortOrder: 'asc' | 'desc';[m
[31m-}[m
[32m+[m[32mimport { FilterState } from '../../interfaces/todo-interfaces';[m
[32m+[m[32mimport { TodoFilterService } from '../../services/todo-filter.service';[m
[32m+[m[32mimport { TodoUtilsService } from '../../services/todo-utils.service';[m
[32m+[m[32mimport { LAYOUT_MATERIAL_IMPORTS } from '../../shared/material-imports';[m
 [m
 @Component({[m
   selector: 'app-todo-layout',[m
   standalone: true,[m
[31m-  imports: [[m
[31m-    CommonModule,[m
[31m-    ReactiveFormsModule,[m
[31m-    FormsModule,[m
[31m-    MatToolbarModule,[m
[31m-    MatButtonModule,[m
[31m-    MatIconModule,[m
[31m-    MatFormFieldModule,[m
[31m-    MatInputModule,[m
[31m-    MatSelectModule,[m
[31m-    MatChipsModule,[m
[31m-    MatMenuModule,[m
[31m-    MatTooltipModule,[m
[31m-    MatSnackBarModule,[m
[31m-    MatDialogModule,[m
[31m-    MatProgressSpinnerModule,[m
[31m-    MatCardModule,[m
[31m-    MatDividerModule,[m
[31m-    MatTableModule,[m
[31m-    MatCheckboxModule,[m
[31m-    MatDatepickerModule,[m
[31m-    MatNativeDateModule,[m
[31m-  ],[m
[32m+[m[32m  imports: LAYOUT_MATERIAL_IMPORTS,[m
   templateUrl: './todo-layout.component.html',[m
   styleUrls: ['./todo-layout.component.scss'][m
 })[m
[36m@@ -102,7 +48,9 @@[m [mexport class TodoLayoutComponent implements OnInit, OnDestroy {[m
   constructor([m
     private dialog: MatDialog,[m
     private snackBar: MatSnackBar,[m
[31m-    private fb: FormBuilder[m
[32m+[m[32m    private fb: FormBuilder,[m
[32m+[m[32m    private filterService: TodoFilterService,[m
[32m+[m[32m    private utilsService: TodoUtilsService[m
   ) {}[m
 [m
   ngOnInit(): void {[m
[36m@@ -143,83 +91,15 @@[m [mexport class TodoLayoutComponent implements OnInit, OnDestroy {[m
 [m
   //reaktiver dataflow für gefilterte und sortierte todos[m
   private setupReactiveStreams(): void { [m
[31m-    this.filteredTodos$ = combineLatest([                 //kombiniert mehrere observable immer wenn neue werte geliefert werden[m
[31m-      this.todos$.pipe(                                   //holt sich die todo liste[m
[31m-        startWith([]),                                    //start mit empty array[m
[31m-        catchError(error => {                             //error handling mit console log und snackbar[m
[31m-          console.error('Error loading todos:', error);[m
[31m-          this.snackBar.open('Fehler beim Laden der Todos, mehr Infos in der Konsole', 'Schließen', { duration: 3000 });[m
[31m-          return of([]);                                  //return empty array bei fehler[m
[31m-        })[m
[31m-      ),[m
[31m-      this.filterSubject.asObservable().pipe([m
[31m-        debounceTime(300)                                 //debounce für filter (speziell für suche alle 300ms)[m
[31m-      )                 [m
[31m-    ]).pipe([m
[31m-      map(([todos, filter]) => {                          //holt sich die todos[m
[31m-        let filtered = this.applyFilters(todos, filter);  //filtert die liste[m
[31m-        return this.applySorting(filtered, filter);       //sortiert die gefilterte liste[m
[31m-      }),[m
[31m-      takeUntil(this.destroy$)                             //beendet subscription automatisch, normal void[m
[32m+[m[32m    this.filteredTodos$ = this.filterService.createFilteredTodosStream([m
[32m+[m[32m      this.todos$,[m
[32m+[m[32m      this.filterSubject,[m
[32m+[m[32m      this.destroy$[m
     );[m
   }[m
 [m
 [m
[31m-  //gibt gefiltertes array aus[m
[31m-  private applyFilters(todos: Todo[], filter: FilterState): Todo[] {[m
[31m-    return todos.filter(todo => {                                           //geht alle todos durch und filtert alle mit false aus[m
[31m-      if (filter.search) {[m
[31m-        const q = filter.search.toLowerCase();                              //suchbegriff in kleinbuchstaben[m
[31m-        const matches = todo.titel.toLowerCase().includes(q) ||             //match mit q?[m
[31m-                        todo.beschreibung.toLowerCase().includes(q) ||[m
[31m-                        todo.id.toString().includes(q);[m
[31m-        if (!matches) return false;                                         //nicht mit q? -> false[m
[31m-      }[m
[31m-      if (filter.status !== 'alle') {                                       //status filter[m
[31m-        const isCompleted = filter.status === 'erledigt';[m
[31m-        if (todo.erledigt !== isCompleted) return false;                    //todo falscher status? -> false[m
[31m-      }[m
[31m-      if (filter.priority !== 'alle') {                                     //priority filter[m
[31m-        if (todo.priority !== filter.priority) return false;                //todo falsche prio? -> false[m
[31m-      }[m
[31m-      return true;                                                          //passt alles? -> true[m
[31m-    });[m
[31m-  }[m
[31m-[m
[31m-  //gibt sortiertes array aus[m
[31m-  private applySorting(todos: Todo[], filter: FilterState): Todo[] {[m
[31m-    if(filter.search === '') //debug[m
[31m-    {[m
[31m-          console.log("Order: "+ filter.sortOrder + " Prio: " + filter.priority + " Suche: Leer" + " Status: " + filter.status);[m
[31m-    }[m
[31m-    else {[m
[31m-      console.log("Order: "+ filter.sortOrder + " Prio: " + filter.priority + " Suche: " + filter.search + " Status: " + filter.status);[m
[31m-    }[m
[31m-    return [...todos].sort((a, b) => {                                      //kopiert todo liste und vergleicht[m
[31m-      let aValue: any, bValue: any;[m
[31m-      switch (filter.sortBy) {[m
[31m-        case 'titel':                                                       //sortiert nach titel alphabetisch unabhängig von groß klein buchstaben[m
[31m-          aValue = a.titel.toLowerCase();[m
[31m-          bValue = b.titel.toLowerCase();[m
[31m-          break;[m
[31m-        case 'priority':                                                    //sortiert nach priorität nach zahlen und vergleicht[m
[31m-          const order = { niedrig: 1, mittel: 2, hoch: 3 } as const;[m
[31m-          aValue = order[a.priority];[m
[31m-          bValue = order[b.priority];[m
[31m-          break;[m
[31m-        case 'erstelltAm':[m
[31m-        case 'endeAm':                                                      //sortiert nach date (wandelt zuerst in zahl um)[m
[31m-          aValue = new Date(a[filter.sortBy]).getTime();[m
[31m-          bValue = new Date(b[filter.sortBy]).getTime();[m
[31m-          break;[m
[31m-        default:[m
[31m-          return 0;                                                         //kein sortieren, gibt todo unverändert aus[m
[31m-      }[m
[31m-      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1;      //-1: a kommt vor b - 1: b kommt vor a, 0: reihenfolge bleibt gleich[m
[31m-      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1;      //asc oder desc[m
[31m-      return 0;[m
[31m-    });[m
[31m-  }[m
[32m+[m[32m  // Diese Methoden wurden in den TodoFilterService ausgelagert[m
 [m
   // Filter handlers[m
   onSearchChange(event: any): void {           //Suchleisten eingabe, pusht neuen filter in filterSubject[m
[36m@@ -243,13 +123,11 @@[m [mexport class TodoLayoutComponent implements OnInit, OnDestroy {[m
     this.onSearchChange({ target: { value: '' } }); //triggert neue filterung nach ''[m
   }[m
   clearAllFilters(): void {                    //Zurücksetzen[m
[31m-    this.currentFilter = { search: '', status: 'alle', priority: 'alle', sortBy: 'erstelltAm', sortOrder: 'desc' }; //Setzt alle filter zurück[m
[32m+[m[32m    this.currentFilter = this.filterService.getDefaultFilter(); //Setzt alle filter zurück[m
     this.onFilterChange();                      //triggert update[m
   }[m
   hasActiveFilters(): boolean {                //Prüft ob suche, status oder priority filter aktiv sind[m
[31m-    return this.currentFilter.search !== '' || [m
[31m-    this.currentFilter.status !== 'alle' || [m
[31m-    this.currentFilter.priority !== 'alle'; [m
[32m+[m[32m    return this.filterService.hasActiveFilters(this.currentFilter);[m
   }[m
 [m
   // Bearbeitungsdialog[m
[36m@@ -339,15 +217,11 @@[m [mexport class TodoLayoutComponent implements OnInit, OnDestroy {[m
 [m
   //Umwandlung priority namen[m
   getPriorityLabel(priority: Priority): string { [m
[31m-    const labels = { [m
[31m-      niedrig: 'Niedrig', mittel: 'Mittel', hoch: 'Hoch' [m
[31m-    }; [m
[31m-    return labels[priority]; [m
[32m+[m[32m    return this.utilsService.getPriorityLabel(priority);[m
   }[m
 [m
   //Prüft ob Enddatum in der Vergangenheit liegt[m
   isOverdue(todo: Todo): boolean { [m
[31m-    return !todo.erledigt &&              //Todo erledigt?[m
[31m-    new Date(todo.endeAm) < new Date();   //Datum in der Vergangenheit?[m
[32m+[m[32m    return this.utilsService.isOverdue(todo);[m
   }[m
 }[m
[1mdiff --git a/src/app/components/todo-table/todo-table.component.html b/src/app/components/todo-table/todo-table.component.html[m
[1mindex 148a5d1..7f5a03f 100644[m
[1m--- a/src/app/components/todo-table/todo-table.component.html[m
[1m+++ b/src/app/components/todo-table/todo-table.component.html[m
[36m@@ -10,33 +10,6 @@[m
         </mat-card-header>[m
         [m
         <mat-card-content>[m
[31m-          <!-- Action Buttons Row -->[m
[31m-          <div class="action-buttons-row">[m
[31m-            <button mat-fab [m
[31m-                    color="primary" [m
[31m-                    (click)="openCreateDialog()"[m
[31m-                    matTooltip="Neues Todo erstellen"[m
[31m-                    class="fab-button">[m
[31m-              <mat-icon>add</mat-icon>[m
[31m-            </button>[m
[31m-            [m
[31m-            <div class="action-buttons">[m
[31m-              <button mat-icon-button [m
[31m-                      (click)="refreshData()"[m
[31m-                      [disabled]="isLoading$ | async"[m
[31m-                      matTooltip="Daten aktualisieren"[m
[31m-                      class="action-button">[m
[31m-                <mat-icon>refresh</mat-icon>[m
[31m-              </button>[m
[31m-              [m
[31m-              <button mat-icon-button [m
[31m-                      (click)="toggleFilters()"[m
[31m-                      matTooltip="Filter umschalten"[m
[31m-                      class="action-button">[m
[31m-                <mat-icon>{{ showFilters ? 'filter_list_off' : 'filter_list' }}</mat-icon>[m
[31m-              </button>[m
[31m-            </div>[m
[31m-          </div>[m
 [m
           <!-- Advanced Filters Panel -->[m
           <div class="filters-panel" [class.expanded]="showFilters">[m
[1mdiff --git a/src/app/components/todo-table/todo-table.component.ts b/src/app/components/todo-table/todo-table.component.ts[m
[1mindex 53e8781..2c6405b 100644[m
[1m--- a/src/app/components/todo-table/todo-table.component.ts[m
[1m+++ b/src/app/components/todo-table/todo-table.component.ts[m
[36m@@ -1,79 +1,23 @@[m
 // Angular Core Imports[m
 import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';[m
[31m-import { CommonModule } from '@angular/common';[m
[31m-import { FormsModule } from '@angular/forms';[m
[31m-[m
[31m-// Angular Material Imports[m
[31m-import { MatTableModule } from '@angular/material/table';[m
[31m-import { MatButtonModule } from '@angular/material/button';[m
[31m-import { MatIconModule } from '@angular/material/icon';[m
[31m-import { MatInputModule } from '@angular/material/input';[m
[31m-import { MatFormFieldModule } from '@angular/material/form-field';[m
[31m-import { MatSelectModule } from '@angular/material/select';[m
[31m-import { MatCheckboxModule } from '@angular/material/checkbox';[m
[31m-import { MatChipsModule } from '@angular/material/chips';[m
[31m-import { MatTooltipModule } from '@angular/material/tooltip';[m
[31m-import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';[m
[31m-import { MatDialogModule, MatDialog } from '@angular/material/dialog';[m
[31m-import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';[m
[31m-import { MatSortModule, Sort } from '@angular/material/sort';[m
[31m-import { MatMenuModule } from '@angular/material/menu';[m
[31m-import { MatDividerModule } from '@angular/material/divider';[m
[31m-import { MatCardModule } from '@angular/material/card';[m
[31m-[m
[31m-// RxJS Imports[m
[31m-import { [m
[31m-  BehaviorSubject, [m
[31m-  combineLatest, [m
[31m-  map, [m
[31m-  Subject, [m
[31m-  takeUntil, [m
[31m-  Observable, [m
[31m-  of, [m
[31m-  catchError,[m
[31m-  startWith,[m
[31m-} from 'rxjs';[m
[32m+[m[32mimport { BehaviorSubject, Subject, Observable } from 'rxjs';[m
[32m+[m[32mimport { MatSnackBar } from '@angular/material/snack-bar';[m
[32m+[m[32mimport { MatDialog } from '@angular/material/dialog';[m
[32m+[m[32mimport { Sort } from '@angular/material/sort';[m
 [m
 // Local Imports[m
 import { Todo, Priority } from '../../models/todo.model';[m
 import { TodoFormDialogComponent, TodoFormData } from '../todo-form-dialog/todo-form-dialog.component';[m
[31m-[m
[31m-// Interfaces für Filter und Sortierung[m
[31m-export interface TableFilter {[m
[31m-  search: string;                                    // Suchbegriff für Titel/Beschreibung[m
[31m-  status: 'alle' | 'offen' | 'erledigt';           // Status-Filter[m
[31m-  priority: Priority | 'alle';                      // Prioritäts-Filter[m
[31m-}[m
[31m-[m
[31m-export interface TableSort {[m
[31m-  active: string;                                    // Spalte nach der sortiert wird[m
[31m-  direction: 'asc' | 'desc';                       // Sortierrichtung[m
[31m-}[m
[32m+[m[32mimport { TableFilter, TableSort, FilterState } from '../../interfaces/todo-interfaces';[m
[32m+[m[32mimport { TodoFilterService } from '../../services/todo-filter.service';[m
[32m+[m[32mimport { TodoUtilsService } from '../../services/todo-utils.service';[m
[32m+[m[32mimport { BASIC_MATERIAL_IMPORTS } from '../../shared/material-imports';[m
 [m
 [m
 @Component({[m
   selector: 'app-todo-table',[m
   standalone: true,[m
[31m-  imports: [[m
[31m-    CommonModule,[m
[31m-    FormsModule,[m
[31m-    MatTableModule,[m
[31m-    MatButtonModule,[m
[31m-    MatIconModule,[m
[31m-    MatInputModule,[m
[31m-    MatFormFieldModule,[m
[31m-    MatSelectModule,[m
[31m-    MatCheckboxModule,[m
[31m-    MatChipsModule,[m
[31m-    MatTooltipModule,[m
[31m-    MatSnackBarModule,[m
[31m-    MatDialogModule,[m
[31m-    MatProgressSpinnerModule,[m
[31m-    MatSortModule,[m
[31m-    MatMenuModule,[m
[31m-    MatDividerModule,[m
[31m-    MatCardModule[m
[31m-  ],[m
[32m+[m[32m  imports: BASIC_MATERIAL_IMPORTS,[m
   templateUrl: './todo-table.component.html',[m
   styleUrls: ['./todo-table.component.css'][m
 })[m
[36m@@ -92,10 +36,12 @@[m [mexport class TodoTableComponent implements OnInit, OnDestroy, OnChanges {[m
 [m
   // RxJS Subjects und Streams[m
   private destroy$ = new Subject<void>();                              // Für cleanup von subscriptions[m
[31m-  private filterSubject = new BehaviorSubject<TableFilter>({          // Filter-State als Stream[m
[32m+[m[32m  private filterSubject = new BehaviorSubject<FilterState>({          // Filter-State als Stream[m
     search: '',[m
     status: 'alle',[m
[31m-    priority: 'alle'[m
[32m+[m[32m    priority: 'alle',[m
[32m+[m[32m    sortBy: 'erstelltAm',[m
[32m+[m[32m    sortOrder: 'desc'[m
   });[m
   private sortSubject = new BehaviorSubject<TableSort>({              // Sortier-State als Stream[m
     active: 'erstelltAm',[m
[36m@@ -104,7 +50,7 @@[m [mexport class TodoTableComponent implements OnInit, OnDestroy, OnChanges {[m
   private loadingSubject = new BehaviorSubject<boolean>(false);       // Loading-State für UI[m
 [m
   // Observable Properties[m
[31m-  currentFilter: TableFilter = { search: '', status: 'alle', priority: 'alle' };  // Aktueller Filter-State[m
[32m+[m[32m  currentFilter: TableFilter = { search: '', status: 'alle', priority: 'alle' };  // Aktueller Filter-State (vereinfacht für UI)[m
   filteredTodos$!: Observable<Todo[]>;                               // Gefilterte Todos als Observable[m
   isLoading$ = this.loadingSubject.asObservable();                   // Loading-State als Observable[m
   [m
[36m@@ -113,7 +59,9 @@[m [mexport class TodoTableComponent implements OnInit, OnDestroy, OnChanges {[m
 [m
   constructor([m
     private dialog: MatDialog,                                         // Für Dialog-Öffnung[m
[31m-    private snackBar: MatSnackBar                                     // Für Benutzer-Feedback[m
[32m+[m[32m    private snackBar: MatSnackBar,                                     // Für Benutzer-Feedback[m
[32m+[m[32m    private filterService: TodoFilterService,                          // Filter-Service[m
[32m+[m[32m    private utilsService: TodoUtilsService                             // Utils-Service[m
   ) {}[m
 [m
   ngOnInit(): void {[m
[36m@@ -133,98 +81,45 @@[m [mexport class TodoTableComponent implements OnInit, OnDestroy, OnChanges {[m
 [m
   // Reaktive Stream-Setup für gefilterte und sortierte Todos[m
   private setupReactiveStreams(): void {[m
[31m-    this.filteredTodos$ = combineLatest([                               // Kombiniert mehrere Observables[m
[31m-      this.todos$.pipe(                                                 // Todos-Stream[m
[31m-        startWith([]),                                                  // Start mit leerem Array[m
[31m-        catchError(error => {                                           // Error-Handling[m
[31m-          console.error('Error loading todos:', error);[m
[31m-          this.snackBar.open('Fehler beim Laden der Todos', 'Schließen', { duration: 3000 });[m
[31m-          return of([]);                                                // Bei Fehler: leeres Array[m
[31m-        })[m
[31m-      ),[m
[31m-      this.filterSubject.asObservable(),                               // Filter-Stream[m
[31m-      this.sortSubject.asObservable()                                  // Sortier-Stream[m
[31m-    ]).pipe([m
[31m-      map(([todos, filter, sort]) => {                                 // Transformiert die kombinierten Daten[m
[31m-        let filtered = this.applyFilters(todos, filter);               // Filtert die Todos[m
[31m-        return this.applySorting(filtered, sort);                      // Sortiert die gefilterten Todos[m
[31m-      }),[m
[31m-      takeUntil(this.destroy$)                                         // Beendet Subscription automatisch[m
[31m-    );[m
[31m-  }[m
[31m-[m
[31m-  // Filtert Todos basierend auf Suchkriterien[m
[31m-  private applyFilters(todos: Todo[], filter: TableFilter): Todo[] {[m
[31m-    return todos.filter(todo => {                                       // Geht alle Todos durch[m
[31m-      // Such-Filter: Titel oder Beschreibung[m
[31m-      if (filter.search) {[m
[31m-        const query = filter.search.toLowerCase();                     // Suchbegriff in Kleinbuchstaben[m
[31m-        const matchesSearch = [m
[31m-          todo.titel.toLowerCase().includes(query) ||                  // Match im Titel?[m
[31m-          todo.beschreibung.toLowerCase().includes(query);             // Match in Beschreibung?[m
[31m-        if (!matchesSearch) return false;                              // Kein Match? -> Todo ausschließen[m
[31m-      }[m
[31m-[m
[31m-      // Status-Filter: Offen oder Erledigt[m
[31m-      if (filter.status !== 'alle') {[m
[31m-        const isCompleted = filter.status === 'erledigt';              // Gesuchter Status[m
[31m-        if (todo.erledigt !== isCompleted) return false;               // Falscher Status? -> Todo ausschließen[m
[31m-      }[m
[31m-[m
[31m-      // Prioritäts-Filter: Niedrig, Mittel oder Hoch[m
[31m-      if (filter.priority !== 'alle') {[m
[31m-        if (todo.priority !== filter.priority) return false;           // Falsche Priorität? -> Todo ausschließen[m
[31m-      }[m
[32m+[m[32m    // Konvertiere TableFilter zu FilterState für den Service[m
[32m+[m[32m    const filterState: FilterState = {[m
[32m+[m[32m      search: this.currentFilter.search,[m
[32m+[m[32m      status: this.currentFilter.status,[m
[32m+[m[32m      priority: this.currentFilter.priority,[m
[32m+[m[32m      sortBy: 'erstelltAm',[m
[32m+[m[32m      sortOrder: 'desc'[m
[32m+[m[32m    };[m
[32m+[m[41m    [m
[32m+[m[32m    const filterState$ = new BehaviorSubject<FilterState>(filterState);[m
 [m
[31m-      return true;                                                     // Alle Filter bestanden? -> Todo behalten[m
[31m-    });[m
[32m+[m[32m    this.filteredTodos$ = this.filterService.createFilteredTodosStream([m
[32m+[m[32m      this.todos$,[m
[32m+[m[32m      filterState$,[m
[32m+[m[32m      this.destroy$[m
[32m+[m[32m    );[m
   }[m
 [m
[31m-  // Sortiert Todos basierend auf gewählter Spalte und Richtung[m
[31m-  private applySorting(todos: Todo[], sort: TableSort): Todo[] {[m
[31m-    return [...todos].sort((a, b) => {                                // Kopiert Array und sortiert[m
[31m-      let aValue: any, bValue: any;                                   // Vergleichswerte[m
[31m-[m
[31m-      switch (sort.active) {                                          // Je nach Spalte unterschiedliche Sortierung[m
[31m-        case 'titel':                                                 // Alphabetische Sortierung[m
[31m-          aValue = a.titel.toLowerCase();                             // Titel in Kleinbuchstaben[m
[31m-          bValue = b.titel.toLowerCase();[m
[31m-          break;[m
[31m-        case 'priority':                                              // Prioritäts-Sortierung (niedrig=1, mittel=2, hoch=3)[m
[31m-          const priorityOrder = { niedrig: 1, mittel: 2, hoch: 3 };[m
[31m-          aValue = priorityOrder[a.priority];                         // Priorität zu Zahl konvertieren[m
[31m-          bValue = priorityOrder[b.priority];[m
[31m-          break;[m
[31m-        case 'erledigt':                                              // Status-Sortierung (false=0, true=1)[m
[31m-          aValue = a.erledigt ? 1 : 0;                               // Boolean zu Zahl konvertieren[m
[31m-          bValue = b.erledigt ? 1 : 0;[m
[31m-          break;[m
[31m-        case 'erstelltAm':[m
[31m-        case 'endeAm':                                                // Datums-Sortierung[m
[31m-          const aDate = a[sort.active as keyof Todo];                // Datum aus Todo holen[m
[31m-          const bDate = b[sort.active as keyof Todo];[m
[31m-          aValue = aDate instanceof Date ? aDate.getTime() : new Date(aDate as string | number).getTime();  // Zu Timestamp konvertieren[m
[31m-          bValue = bDate instanceof Date ? bDate.getTime() : new Date(bDate as string | number).getTime();