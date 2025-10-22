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
  debounceTime, 
  distinctUntilChanged, 
  map, 
  Subject, 
  takeUntil, 
  Observable, 
  of, 
  catchError,
  startWith,
  switchMap,
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
  selector: 'app-enhanced-todo-table',
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
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="enhanced-table-container">
      <!-- Modern Header with Card Design -->
      <mat-card class="header-card">
        <mat-card-header>
          <div mat-card-avatar class="header-avatar">
            <mat-icon>assignment</mat-icon>
          </div>
          <mat-card-title>Todo Management</mat-card-title>
          <mat-card-subtitle>Verwalten Sie Ihre Aufgaben effizient</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Action Buttons Row -->
          <div class="action-buttons-row">
            <button mat-fab 
                    color="primary" 
                    (click)="openCreateDialog()"
                    matTooltip="Neues Todo erstellen"
                    class="fab-button">
              <mat-icon>add</mat-icon>
            </button>
            
            <div class="action-buttons">
              <button mat-icon-button 
                      (click)="refreshData()"
                      [disabled]="isLoading$ | async"
                      matTooltip="Daten aktualisieren"
                      class="action-button">
                <mat-icon>refresh</mat-icon>
              </button>
              
              <button mat-icon-button 
                      (click)="toggleFilters()"
                      matTooltip="Filter umschalten"
                      class="action-button">
                <mat-icon>{{ showFilters ? 'filter_list_off' : 'filter_list' }}</mat-icon>
              </button>
            </div>
          </div>

          <!-- Advanced Filters Panel -->
          <div class="filters-panel" [class.expanded]="showFilters">
            <div class="filters-content">
              <!-- Search Section -->
              <div class="search-section">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Suche in Todos</mat-label>
                  <input matInput 
                         [(ngModel)]="currentFilter.search" 
                         (input)="onSearchChange($event)"
                         placeholder="Titel, Beschreibung oder ID eingeben...">
                  <mat-icon matPrefix>search</mat-icon>
                  <button mat-icon-button 
                          matSuffix 
                          *ngIf="currentFilter.search"
                          (click)="clearSearch()"
                          matTooltip="Suche löschen">
                    <mat-icon>clear</mat-icon>
                  </button>
                </mat-form-field>
              </div>

              <!-- Filter Chips -->
              <div class="filter-chips">
                <mat-chip-set>
                  <mat-chip 
                    [class.selected]="currentFilter.status === 'alle'"
                    (click)="setStatusFilter('alle')"
                    matTooltip="Alle Todos anzeigen">
                    <mat-icon matChipAvatar>list</mat-icon>
                    Alle
                  </mat-chip>
                  <mat-chip 
                    [class.selected]="currentFilter.status === 'offen'"
                    (click)="setStatusFilter('offen')"
                    matTooltip="Nur offene Todos">
                    <mat-icon matChipAvatar>pending</mat-icon>
                    Offen
                  </mat-chip>
                  <mat-chip 
                    [class.selected]="currentFilter.status === 'erledigt'"
                    (click)="setStatusFilter('erledigt')"
                    matTooltip="Nur erledigte Todos">
                    <mat-icon matChipAvatar>check_circle</mat-icon>
                    Erledigt
                  </mat-chip>
                </mat-chip-set>
              </div>

              <!-- Priority Filter -->
              <div class="priority-filter">
                <mat-form-field appearance="outline" class="priority-field">
                  <mat-label>Priorität filtern</mat-label>
                  <mat-select [(ngModel)]="currentFilter.priority" (selectionChange)="onFilterChange()">
                    <mat-option value="alle">
                      <span class="priority-option all">Alle Prioritäten</span>
                    </mat-option>
                    <mat-option value="niedrig">
                      <span class="priority-option niedrig">Niedrig</span>
                    </mat-option>
                    <mat-option value="mittel">
                      <span class="priority-option mittel">Mittel</span>
                    </mat-option>
                    <mat-option value="hoch">
                      <span class="priority-option hoch">Hoch</span>
                    </mat-option>
                  </mat-select>
                  <mat-icon matPrefix>flag</mat-icon>
                </mat-form-field>
              </div>

              <!-- Quick Actions -->
              <div class="quick-actions">
                <button mat-stroked-button 
                        (click)="clearAllFilters()"
                        [disabled]="!hasActiveFilters()"
                        class="clear-filters-btn">
                  <mat-icon>clear_all</mat-icon>
                  Filter zurücksetzen
                </button>
                
                <span class="results-count">
                  {{ (filteredTodos$ | async)?.length || 0 }} von {{ (todos$ | async)?.length || 0 }} Todos
                </span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading$ | async" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Lade Todos...</p>
      </div>

      <!-- Table -->
      <div *ngIf="!(isLoading$ | async)" class="table-container">
        <table mat-table 
               [dataSource]="(paginatedTodos$ | async) || []" 
               matSort
               (matSortChange)="onSortChange($event)"
               class="enhanced-table">
          
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let todo" class="id-cell">{{ todo.id }}</td>
          </ng-container>

          <!-- Title Column -->
          <ng-container matColumnDef="titel">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Titel</th>
            <td mat-cell *matCellDef="let todo" class="title-cell">
              <div class="title-content">
                <span class="title-text" [matTooltip]="todo.titel">{{ todo.titel }}</span>
                <mat-icon *ngIf="isOverdue(todo)" 
                          class="overdue-icon" 
                          matTooltip="Überfällig">warning</mat-icon>
              </div>
            </td>
          </ng-container>

          <!-- Description Column -->
          <ng-container matColumnDef="beschreibung">
            <th mat-header-cell *matHeaderCellDef>Beschreibung</th>
            <td mat-cell *matCellDef="let todo" class="description-cell">
              <span [matTooltip]="todo.beschreibung">{{ getTruncatedDescription(todo.beschreibung) }}</span>
            </td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Priorität</th>
            <td mat-cell *matCellDef="let todo" class="priority-cell">
              <mat-chip [class]="'priority-chip priority-' + todo.priority">
                {{ getPriorityLabel(todo.priority) }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="erledigt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let todo" class="status-cell">
              <mat-checkbox 
                [checked]="todo.erledigt" 
                (change)="onToggleStatus(todo)"
                [color]="'primary'"
                [matTooltip]="todo.erledigt ? 'Als offen markieren' : 'Als erledigt markieren'">
                {{ todo.erledigt ? 'Erledigt' : 'Offen' }}
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Created Date Column -->
          <ng-container matColumnDef="erstelltAm">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Erstellt</th>
            <td mat-cell *matCellDef="let todo" class="date-cell">
              {{ todo.erstelltAm | date:'dd.MM.yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Due Date Column -->
          <ng-container matColumnDef="endeAm">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Fällig</th>
            <td mat-cell *matCellDef="let todo" class="due-date-cell" [class.overdue]="isOverdue(todo)">
              {{ todo.endeAm | date:'dd.MM.yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Aktionen</th>
            <td mat-cell *matCellDef="let todo" class="actions-cell">
              <button mat-icon-button [matMenuTriggerFor]="actionMenu" matTooltip="Aktionen">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="openEditDialog(todo)">
                  <mat-icon>edit</mat-icon>
                  <span>Bearbeiten</span>
                </button>
                <button mat-menu-item (click)="onToggleStatus(todo)">
                  <mat-icon>{{ todo.erledigt ? 'undo' : 'check' }}</mat-icon>
                  <span>{{ todo.erledigt ? 'Als offen markieren' : 'Als erledigt markieren' }}</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="onDelete(todo)" class="delete-action">
                  <mat-icon>delete</mat-icon>
                  <span>Löschen</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              [class.completed-row]="row.erledigt"
              [class.overdue-row]="isOverdue(row)"></tr>
        </table>

        <!-- No data message -->
        <div *ngIf="(((filteredTodos$ | async)?.length) || 0) === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <h3>Keine Todos gefunden</h3>
          <p>Versuchen Sie, Ihre Suchkriterien zu ändern oder erstellen Sie ein neues Todo.</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Erstes Todo erstellen
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <mat-paginator 
        *ngIf="(((filteredTodos$ | async)?.length) || 0) > 0"
        [length]="(pagination$ | async)?.length || 0"
        [pageSize]="(pagination$ | async)?.pageSize || 10"
        [pageIndex]="(pagination$ | async)?.pageIndex || 0"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .enhanced-table-container {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      gap: 16px;
    }

    /* Modern Header Card */
    .header-card {
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 0;
    }

    .header-card mat-card-header {
      margin-bottom: 16px;
    }

    .header-avatar {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .header-card mat-card-title {
      color: white;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .header-card mat-card-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    /* Action Buttons Row */
    .action-buttons-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .fab-button {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .action-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Filters Panel */
    .filters-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-in-out;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .filters-panel.expanded {
      max-height: 500px;
    }

    .filters-content {
      padding: 20px;
    }

    /* Search Section */
    .search-section {
      margin-bottom: 20px;
    }

    .search-field {
      width: 100%;
    }

    .search-field ::ng-deep .mat-mdc-form-field {
      background: white;
      border-radius: 12px;
    }

    .search-field ::ng-deep .mat-mdc-form-field-outline {
      border-radius: 12px;
    }

    /* Filter Chips */
    .filter-chips {
      margin-bottom: 20px;
    }

    .filter-chips mat-chip {
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .filter-chips mat-chip:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .filter-chips mat-chip.selected {
      background: white;
      color: #667eea;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Priority Filter */
    .priority-filter {
      margin-bottom: 20px;
    }

    .priority-field {
      width: 100%;
    }

    .priority-field ::ng-deep .mat-mdc-form-field {
      background: white;
      border-radius: 12px;
    }

    .priority-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 8px;
      font-weight: 500;
    }

    .priority-option.all {
      background-color: #f5f5f5;
      color: #666;
    }

    .priority-option.niedrig {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .priority-option.mittel {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .priority-option.hoch {
      background-color: #ffebee;
      color: #c62828;
    }

    /* Quick Actions */
    .quick-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .clear-filters-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .clear-filters-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .results-count {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .loading-container p {
      margin-top: 20px;
      font-size: 16px;
      color: #666;
      font-weight: 500;
    }

    /* Modern Table Container */
    .table-container {
      flex: 1;
      overflow: auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    .enhanced-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .enhanced-table th {
      font-weight: 600;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #495057;
      padding: 16px;
      border-bottom: 2px solid #dee2e6;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .enhanced-table td {
      padding: 16px;
      border-bottom: 1px solid #f1f3f4;
      transition: background-color 0.2s ease;
    }

    .enhanced-table tr:hover td {
      background-color: #f8f9fa;
    }

    /* Table Cell Styling */
    .title-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title-text {
      font-weight: 600;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #2c3e50;
    }

    .overdue-icon {
      color: #e74c3c;
      font-size: 18px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .description-cell {
      max-width: 300px;
      color: #6c757d;
    }

    /* Enhanced Priority Chips */
    .priority-chip {
      font-size: 11px;
      font-weight: 600;
      min-width: 70px;
      text-align: center;
      border-radius: 20px;
      padding: 6px 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .priority-chip.priority-niedrig {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .priority-chip.priority-mittel {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .priority-chip.priority-hoch {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .due-date-cell.overdue {
      color: #e74c3c;
      font-weight: 600;
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
      border-radius: 8px;
      padding: 4px 8px;
    }

    .completed-row {
      opacity: 0.6;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .completed-row .title-text {
      text-decoration: line-through;
      color: #6c757d;
    }

    .overdue-row {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border-left: 4px solid #ffc107;
    }

    .actions-cell {
      width: 80px;
      text-align: center;
    }

    .delete-action {
      color: #e74c3c;
    }

    /* Enhanced No Data State */
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      text-align: center;
      margin: 20px;
    }

    .no-data mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 24px;
      color: #adb5bd;
      opacity: 0.7;
    }

    .no-data h3 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      color: #495057;
    }

    .no-data p {
      margin: 0 0 32px 0;
      font-size: 16px;
      color: #6c757d;
      max-width: 400px;
      line-height: 1.5;
    }

    .no-data button {
      border-radius: 25px;
      padding: 12px 24px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .enhanced-table-container {
        padding: 12px;
        gap: 12px;
      }
      
      .header-card {
        border-radius: 12px;
      }
      
      .action-buttons-row {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .action-buttons {
        justify-content: center;
      }
      
      .filters-content {
        padding: 16px;
      }
      
      .quick-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .enhanced-table td {
        padding: 12px 8px;
        font-size: 14px;
      }
      
      .enhanced-table th {
        padding: 12px 8px;
        font-size: 14px;
      }
    }

    @media (max-width: 600px) {
      .enhanced-table-container {
        padding: 8px;
        gap: 8px;
      }
      
      .header-card mat-card-title {
        font-size: 1.2rem;
      }
      
      .title-text {
        max-width: 120px;
        font-size: 14px;
      }
      
      .description-cell {
        max-width: 150px;
        font-size: 12px;
      }
      
      .priority-chip {
        font-size: 10px;
        min-width: 50px;
        padding: 4px 8px;
      }
      
      .no-data {
        padding: 40px 20px;
      }
      
      .no-data h3 {
        font-size: 20px;
      }
      
      .no-data p {
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .enhanced-table-container {
        padding: 4px;
      }
      
      .header-card {
        margin: 0;
        border-radius: 8px;
      }
      
      .filters-content {
        padding: 12px;
      }
      
      .enhanced-table td {
        padding: 8px 4px;
        font-size: 12px;
      }
      
      .enhanced-table th {
        padding: 8px 4px;
        font-size: 12px;
      }
    }
  `]
})
export class EnhancedTodoTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() todos$!: Observable<Todo[]>;
  @Output() create = new EventEmitter<Omit<Todo, 'id' | 'erstelltAm'>>();
  @Output() update = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<number>();

  displayedColumns: string[] = [
    'id', 'titel', 'beschreibung', 'priority', 'erledigt', 'erstelltAm', 'endeAm', 'actions'
  ];

  // RxJS streams for reactive data management
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

  // Public observables
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

  /**
   * Sets up reactive streams for filtering, sorting, and pagination
   */
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

    // Apply pagination to filtered and sorted data
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

  /**
   * Applies filters to the todo list
   */
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

  /**
   * Applies sorting to the todo list
   */
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

  /**
   * Handles search input changes with debouncing
   */
  onSearchChange(event: any): void {
    this.currentFilter.search = event.target.value;
    this.filterSubject.next(this.currentFilter);
  }

  /**
   * Handles filter changes
   */
  onFilterChange(): void {
    this.filterSubject.next(this.currentFilter);
  }

  /**
   * Handles sort changes
   */
  onSortChange(sort: Sort): void {
    this.sortSubject.next({
      active: sort.active,
      direction: sort.direction as 'asc' | 'desc'
    });
  }

  /**
   * Handles pagination changes
   */
  onPageChange(event: PageEvent): void {
    this.paginationSubject.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      length: event.length
    });
  }

  /**
   * Opens the create todo dialog
   */
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

  /**
   * Opens the edit todo dialog
   */
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

  /**
   * Handles todo status toggle
   */
  onToggleStatus(todo: Todo): void {
    this.toggle.emit(todo.id);
    const action = todo.erledigt ? 'als offen markiert' : 'als erledigt markiert';
    this.snackBar.open(`Todo "${todo.titel}" wurde ${action}`, 'Schließen', { duration: 2000 });
  }

  /**
   * Handles todo deletion
   */
  onDelete(todo: Todo): void {
    if (confirm(`Möchten Sie das Todo "${todo.titel}" wirklich löschen?`)) {
      this.delete.emit(todo.id);
      this.snackBar.open('Todo erfolgreich gelöscht', 'Schließen', { duration: 2000 });
    }
  }

  /**
   * Refreshes the data
   */
  refreshData(): void {
    this.loadingSubject.next(true);
    // Simulate loading time
    setTimeout(() => {
      this.loadingSubject.next(false);
      this.snackBar.open('Daten aktualisiert', 'Schließen', { duration: 1500 });
    }, 1000);
  }

  /**
   * Checks if a todo is overdue
   */
  isOverdue(todo: Todo): boolean {
    return !todo.erledigt && new Date(todo.endeAm) < new Date();
  }

  /**
   * Gets truncated description for display
   */
  getTruncatedDescription(description: string, maxLength: number = 50): string {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  }

  /**
   * Gets priority label for display
   */
  getPriorityLabel(priority: Priority): string {
    const labels = {
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];
  }

  /**
   * Toggles the filters panel visibility
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Sets status filter using chip selection
   */
  setStatusFilter(status: 'alle' | 'offen' | 'erledigt'): void {
    this.currentFilter.status = status;
    this.onFilterChange();
  }

  /**
   * Clears the search input
   */
  clearSearch(): void {
    this.currentFilter.search = '';
    this.onSearchChange({ target: { value: '' } });
  }

  /**
   * Clears all active filters
   */
  clearAllFilters(): void {
    this.currentFilter = { search: '', status: 'alle', priority: 'alle' };
    this.onFilterChange();
    this.snackBar.open('Alle Filter wurden zurückgesetzt', 'Schließen', { duration: 2000 });
  }

  /**
   * Checks if any filters are active
   */
  hasActiveFilters(): boolean {
    return this.currentFilter.search !== '' || 
           this.currentFilter.status !== 'alle' || 
           this.currentFilter.priority !== 'alle';
  }
}
