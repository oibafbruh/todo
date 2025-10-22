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
  templateUrl: `./card.html`,
  styleUrls: [`./card.css`]
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
