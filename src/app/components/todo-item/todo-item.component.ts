import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <div class="card aufgaben-card" [class.erledigt]="todo.erledigt" [ngClass]="'priority-' + todo.priority">
      <div class="card-body" *ngIf="!isEditing; else editTpl">
        <div class="aufgabe-header">
          <button mat-icon-button class="drag-handle" title="Ziehen zum Neuordnen">
            <mat-icon>drag_indicator</mat-icon>
          </button>

          <mat-checkbox [checked]="todo.erledigt" (change)="toggle.emit(todo.id)" color="primary" class="todo-checkbox"></mat-checkbox>

          <div class="aufgabe-content">
            <div class="aufgabe-title-row">
              <h3 class="aufgabe-titel">{{ todo.titel }}</h3>
              <span class="priority-badge" [ngClass]="'priority-' + todo.priority">{{ getPriorityLabel(todo.priority) }}</span>
            </div>
            <p class="aufgabe-beschreibung" *ngIf="todo.beschreibung">{{ todo.beschreibung }}</p>
            <div class="aufgabe-meta">
              <mat-icon class="meta-icon">schedule</mat-icon>
              <span>Erstellt am {{ todo.erstelltAm | date:'dd.MM.yyyy, HH:mm' }} Uhr, fällig bis {{ todo.endeAm | date:'dd.MM.yyyy, HH:mm' }} Uhr</span>
            </div>
          </div>

          <div class="aufgabe-actions">
            <button mat-icon-button (click)="enterEdit()" title="Bearbeiten"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete.emit(todo.id)" title="Löschen"><mat-icon>delete</mat-icon></button>
          </div>
        </div>
      </div>

      <ng-template #editTpl>
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="saveEdit()">
            <mat-form-field appearance="outline" class="flex-2">
              <mat-label>Titel</mat-label>
              <input matInput formControlName="titel" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Priorität</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="niedrig">Niedrig</mat-option>
                <mat-option value="mittel">Mittel</mat-option>
                <mat-option value="hoch">Hoch</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Beschreibung</mat-label>
              <textarea matInput rows="2" formControlName="beschreibung"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Enddatum</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="endeAm" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <div class="form-actions">
              <button type="submit" mat-raised-button color="primary">Speichern</button>
              <button type="button" mat-button (click)="cancelEdit()">Abbrechen</button>
            </div>
          </form>
        </div>
      </ng-template>
    </div>
  `
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() toggle = new EventEmitter<number>();
  @Output() save = new EventEmitter<{ id: number; titel: string; beschreibung: string; priority: 'niedrig'|'mittel'|'hoch'; endeAm: Date }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();

  isEditing = false;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialize form after FormBuilder is available
    this.form = this.fb.group({
      titel: ['', [Validators.required, Validators.minLength(1)]],
      beschreibung: [''],
      priority: ['mittel' as 'niedrig'|'mittel'|'hoch', [Validators.required]],
      endeAm: [new Date(), [Validators.required]]
    });

    this.form.statusChanges.subscribe(status => {
      if (status === 'INVALID') {
        console.group('🔴 Edit Todo Form Errors');
        Object.entries(this.form.controls).forEach(([k, c]) => { if (c.errors) console.error(`${k}:`, c.errors); });
        console.groupEnd();
      }
    });
  }

  enterEdit() {
    this.isEditing = true;
    this.form.setValue({
      titel: this.todo.titel,
      beschreibung: this.todo.beschreibung,
      priority: this.todo.priority,
      endeAm: this.todo.endeAm
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.cancel.emit();
  }

  saveEdit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit({ id: this.todo.id, ...(this.form.value as any) });
    this.isEditing = false;
  }

  getPriorityLabel(priority: 'niedrig'|'mittel'|'hoch'): string {
    const labels = {
      'niedrig': 'Niedrig',
      'mittel': 'Mittel',
      'hoch': 'Hoch'
    };
    return labels[priority];
  }
}


