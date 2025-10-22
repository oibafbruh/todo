import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { Todo, Priority } from '../../models/todo.model';

@Component({
  selector: 'app-todo-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatRippleModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDividerModule
  ],
  template: `
    <mat-card 
      class="todo-card"
      [class.completed]="todo.erledigt"
      [class.overdue]="isOverdue"
      [class.due-soon]="isDueSoon"
      matRipple
      [matRippleDisabled]="isEditing">
      
      <!-- Card Header -->
      <mat-card-header class="card-header">
        <div class="header-content">
          <div class="todo-info">
            <mat-card-title class="todo-title">
              <span *ngIf="!isEditing" class="title-text">{{ todo.titel }}</span>
              <mat-form-field *ngIf="isEditing" appearance="outline" class="edit-field">
                <input matInput 
                       [(ngModel)]="editData.titel" 
                       placeholder="Titel"
                       (keydown.enter)="saveEdit()"
                       (keydown.escape)="cancelEdit()">
              </mat-form-field>
            </mat-card-title>
            
            <mat-card-subtitle class="todo-meta">
              <span class="todo-id">#{{ todo.id }}</span>
              <span class="created-date">Erstellt: {{ todo.erstelltAm | date:'dd.MM.yyyy' }}</span>
            </mat-card-subtitle>
          </div>
          
          <div class="header-actions">
            <button mat-icon-button 
                    [matMenuTriggerFor]="actionMenu"
                    matTooltip="Aktionen"
                    class="action-button">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <mat-menu #actionMenu="matMenu" class="action-menu">
              <button mat-menu-item (click)="startEdit()">
                <mat-icon>edit</mat-icon>
                <span>Bearbeiten</span>
              </button>
              <button mat-menu-item (click)="toggleStatus()">
                <mat-icon>{{ todo.erledigt ? 'undo' : 'check_circle' }}</mat-icon>
                <span>{{ todo.erledigt ? 'Als offen markieren' : 'Als erledigt markieren' }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="deleteTodo()" class="delete-action">
                <mat-icon>delete</mat-icon>
                <span>Löschen</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-card-header>

      <!-- Card Content -->
      <mat-card-content class="card-content">
        <!-- Description -->
        <div class="description-section">
          <span *ngIf="!isEditing" class="description-text">{{ todo.beschreibung }}</span>
          <mat-form-field *ngIf="isEditing" appearance="outline" class="edit-field full-width">
            <textarea matInput 
                      [(ngModel)]="editData.beschreibung" 
                      placeholder="Beschreibung"
                      rows="3"></textarea>
          </mat-form-field>
        </div>

        <!-- Priority and Status -->
        <div class="status-section">
          <div class="priority-status">
            <mat-chip 
              [class]="'priority-chip priority-' + todo.priority"
              matTooltip="Priorität: {{ getPriorityLabel(todo.priority) }}">
              <mat-icon matChipAvatar>{{ getPriorityIcon(todo.priority) }}</mat-icon>
              {{ getPriorityLabel(todo.priority) }}
            </mat-chip>
            
            <mat-chip 
              *ngIf="isOverdue"
              class="overdue-chip"
              matTooltip="Überfällig">
              <mat-icon matChipAvatar>warning</mat-icon>
              Überfällig
            </mat-chip>
            
            <mat-chip 
              *ngIf="isDueSoon && !isOverdue"
              class="due-soon-chip"
              matTooltip="Fällig in weniger als 24 Stunden">
              <mat-icon matChipAvatar>schedule</mat-icon>
              Bald fällig
            </mat-chip>
          </div>

          <!-- Status Toggle -->
          <div class="status-toggle">
            <mat-slide-toggle 
              [checked]="todo.erledigt"
              (change)="toggleStatus()"
              [color]="'primary'"
              matTooltip="{{ todo.erledigt ? 'Als offen markieren' : 'Als erledigt markieren' }}">
              <span class="toggle-label">{{ todo.erledigt ? 'Erledigt' : 'Offen' }}</span>
            </mat-slide-toggle>
          </div>
        </div>

        <!-- Due Date -->
        <div class="due-date-section">
          <div class="due-date-info">
            <mat-icon class="due-date-icon">event</mat-icon>
            <span *ngIf="!isEditing" class="due-date-text">
              Fällig: {{ todo.endeAm | date:'dd.MM.yyyy HH:mm' }}
            </span>
            <mat-form-field *ngIf="isEditing" appearance="outline" class="edit-field">
              <input matInput 
                     [matDatepicker]="picker" 
                     [(ngModel)]="editData.endeAm"
                     placeholder="Fälligkeitsdatum">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>
        </div>

        <!-- Edit Actions -->
        <div *ngIf="isEditing" class="edit-actions">
          <button mat-button (click)="cancelEdit()" class="cancel-button">
            <mat-icon>close</mat-icon>
            Abbrechen
          </button>
          <button mat-raised-button 
                  color="primary" 
                  (click)="saveEdit()"
                  [disabled]="!isEditValid()"
                  class="save-button">
            <mat-icon>save</mat-icon>
            Speichern
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .todo-card {
      border-radius: var(--md-sys-shape-corner-large);
      box-shadow: var(--md-sys-elevation-2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .todo-card:hover {
      box-shadow: var(--md-sys-elevation-3);
      transform: translateY(-2px);
    }

    .todo-card.completed {
      opacity: 0.7;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .todo-card.completed .todo-title .title-text {
      text-decoration: line-through;
      color: #6c757d;
    }

    .todo-card.overdue {
      border-left: 4px solid var(--priority-high);
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    }

    .todo-card.due-soon {
      border-left: 4px solid var(--priority-medium);
      background: linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%);
    }

    .card-header {
      padding: var(--md-sys-spacing-md);
      padding-bottom: var(--md-sys-spacing-sm);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .todo-info {
      flex: 1;
      min-width: 0;
    }

    .todo-title {
      margin: 0 0 var(--md-sys-spacing-xs) 0;
      font-size: 18px;
      font-weight: 500;
      line-height: 24px;
    }

    .title-text {
      color: #1a1a1a;
      word-break: break-word;
    }

    .todo-meta {
      display: flex;
      gap: var(--md-sys-spacing-sm);
      font-size: 12px;
      color: #6c757d;
      margin: 0;
    }

    .todo-id {
      font-weight: 500;
      color: #4285f4;
    }

    .header-actions {
      flex-shrink: 0;
    }

    .action-button {
      color: #6c757d;
    }

    .action-button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .card-content {
      padding: 0 var(--md-sys-spacing-md) var(--md-sys-spacing-md);
    }

    .description-section {
      margin-bottom: var(--md-sys-spacing-md);
    }

    .description-text {
      font-size: 14px;
      line-height: 20px;
      color: #495057;
      word-break: break-word;
    }

    .status-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--md-sys-spacing-md);
      flex-wrap: wrap;
      gap: var(--md-sys-spacing-sm);
    }

    .priority-status {
      display: flex;
      gap: var(--md-sys-spacing-xs);
      flex-wrap: wrap;
    }

    .priority-chip {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: var(--md-sys-shape-corner-large);
    }

    .priority-chip.priority-hoch {
      background-color: var(--priority-high-container);
      color: var(--priority-high);
    }

    .priority-chip.priority-mittel {
      background-color: var(--priority-medium-container);
      color: var(--priority-medium);
    }

    .priority-chip.priority-niedrig {
      background-color: var(--priority-low-container);
      color: var(--priority-low);
    }

    .overdue-chip {
      background-color: #ffebee;
      color: #c62828;
      animation: pulse 2s infinite;
    }

    .due-soon-chip {
      background-color: #fff3e0;
      color: #f57c00;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .status-toggle {
      display: flex;
      align-items: center;
    }

    .toggle-label {
      margin-left: var(--md-sys-spacing-xs);
      font-size: 12px;
      font-weight: 500;
      color: #495057;
    }

    .due-date-section {
      margin-bottom: var(--md-sys-spacing-md);
    }

    .due-date-info {
      display: flex;
      align-items: center;
      gap: var(--md-sys-spacing-xs);
    }

    .due-date-icon {
      font-size: 16px;
      color: #6c757d;
    }

    .due-date-text {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }

    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--md-sys-spacing-sm);
      margin-top: var(--md-sys-spacing-md);
      padding-top: var(--md-sys-spacing-md);
      border-top: 1px solid #e9ecef;
    }

    .edit-field {
      width: 100%;
    }

    .edit-field.full-width {
      width: 100%;
    }

    .cancel-button {
      color: #6c757d;
    }

    .save-button {
      border-radius: var(--md-sys-shape-corner-large);
    }

    .delete-action {
      color: #e74c3c;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .status-section {
        flex-direction: column;
        align-items: stretch;
        gap: var(--md-sys-spacing-sm);
      }

      .priority-status {
        justify-content: center;
      }

      .status-toggle {
        justify-content: center;
      }

      .edit-actions {
        flex-direction: column;
      }
    }

    /* Focus styles for accessibility */
    .todo-card:focus-within {
      outline: 2px solid #4285f4;
      outline-offset: 2px;
    }

    /* Animation for card appearance */
    .todo-card {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TodoCardComponent implements OnInit, OnDestroy {
  @Input() todo!: Todo;
  @Output() update = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<number>();

  isEditing = false;
  editData: Partial<Todo> = {};
  private destroy$ = new Subject<void>();

  get isOverdue(): boolean {
    return !this.todo.erledigt && new Date(this.todo.endeAm) < new Date();
  }

  get isDueSoon(): boolean {
    if (this.todo.erledigt || this.isOverdue) return false;
    const dueDate = new Date(this.todo.endeAm);
    const now = new Date();
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit(): void {
    this.isEditing = true;
    this.editData = {
      titel: this.todo.titel,
      beschreibung: this.todo.beschreibung,
      priority: this.todo.priority,
      endeAm: this.todo.endeAm
    };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editData = {};
  }

  saveEdit(): void {
    if (this.isEditValid()) {
      const updatedTodo: Todo = {
        ...this.todo,
        ...this.editData
      } as Todo;
      
      this.update.emit(updatedTodo);
      this.isEditing = false;
      this.editData = {};
    }
  }

  isEditValid(): boolean {
    return !!(this.editData.titel?.trim() && 
              this.editData.beschreibung?.trim() && 
              this.editData.priority && 
              this.editData.endeAm);
  }

  toggleStatus(): void {
    this.toggle.emit(this.todo.id);
  }

  deleteTodo(): void {
    if (confirm(`Möchten Sie das Todo "${this.todo.titel}" wirklich löschen?`)) {
      this.delete.emit(this.todo.id);
    }
  }

  getPriorityLabel(priority: Priority): string {
    const labels = {
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];
  }

  getPriorityIcon(priority: Priority): string {
    const icons = {
      niedrig: 'keyboard_arrow_down',
      mittel: 'remove',
      hoch: 'keyboard_arrow_up'
    };
    return icons[priority];
  }
}
