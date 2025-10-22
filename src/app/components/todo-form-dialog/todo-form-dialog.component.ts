import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Todo, Priority } from '../../models/todo.model';

export interface TodoFormData {
  todo?: Todo;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-todo-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
        </div>
        <div class="header-content">
          <h2 mat-dialog-title class="dialog-title headline-medium">
            {{ data.mode === 'create' ? 'Neues Todo erstellen' : 'Todo bearbeiten' }}
          </h2>
          <p class="dialog-subtitle body-medium">
            {{ data.mode === 'create' ? 'Erstellen Sie eine neue Aufgabe' : 'Bearbeiten Sie die Todo-Details' }}
          </p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="todoForm" class="todo-form">
          <!-- Title Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titel *</mat-label>
            <input matInput 
                   formControlName="titel" 
                   placeholder="Titel des Todos eingeben..."
                   maxlength="100">
            <mat-icon matSuffix>title</mat-icon>
            <mat-error *ngIf="todoForm.get('titel')?.hasError('required')">
              Titel ist erforderlich
            </mat-error>
            <mat-error *ngIf="todoForm.get('titel')?.hasError('minlength')">
              Titel muss mindestens 3 Zeichen lang sein
            </mat-error>
            <mat-error *ngIf="todoForm.get('titel')?.hasError('maxlength')">
              Titel darf maximal 100 Zeichen lang sein
            </mat-error>
          </mat-form-field>

          <!-- Description Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Beschreibung *</mat-label>
            <textarea matInput 
                      formControlName="beschreibung" 
                      placeholder="Beschreibung des Todos eingeben..."
                      rows="4"
                      maxlength="500"></textarea>
            <mat-icon matSuffix>description</mat-icon>
            <mat-error *ngIf="todoForm.get('beschreibung')?.hasError('required')">
              Beschreibung ist erforderlich
            </mat-error>
            <mat-error *ngIf="todoForm.get('beschreibung')?.hasError('minlength')">
              Beschreibung muss mindestens 10 Zeichen lang sein
            </mat-error>
            <mat-error *ngIf="todoForm.get('beschreibung')?.hasError('maxlength')">
              Beschreibung darf maximal 500 Zeichen lang sein
            </mat-error>
          </mat-form-field>

          <!-- Priority Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Priorität *</mat-label>
            <mat-select formControlName="priority">
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
            <mat-icon matSuffix>flag</mat-icon>
            <mat-error *ngIf="todoForm.get('priority')?.hasError('required')">
              Priorität ist erforderlich
            </mat-error>
          </mat-form-field>

          <!-- Due Date Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fälligkeitsdatum *</mat-label>
            <input matInput 
                   [matDatepicker]="picker" 
                   formControlName="endeAm"
                   placeholder="Fälligkeitsdatum auswählen">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-icon matSuffix>event</mat-icon>
            <mat-error *ngIf="todoForm.get('endeAm')?.hasError('required')">
              Fälligkeitsdatum ist erforderlich
            </mat-error>
            <mat-error *ngIf="todoForm.get('endeAm')?.hasError('futureDate')">
              Fälligkeitsdatum muss in der Zukunft liegen
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" type="button" class="cancel-button">
          Abbrechen
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()" 
                [disabled]="todoForm.invalid"
                type="button"
                class="save-button">
          <mat-icon>{{ data.mode === 'create' ? 'add' : 'save' }}</mat-icon>
          {{ data.mode === 'create' ? 'Erstellen' : 'Speichern' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
      max-width: 600px;
      border-radius: var(--md-sys-shape-corner-large);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: var(--md-sys-spacing-md);
      margin-bottom: var(--md-sys-spacing-lg);
      padding-bottom: var(--md-sys-spacing-md);
      border-bottom: 1px solid #e9ecef;
    }

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--md-sys-shape-corner-large);
      background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
      color: white;
    }

    .header-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-content {
      flex: 1;
    }

    .dialog-title {
      margin: 0 0 var(--md-sys-spacing-xs) 0;
      color: #1a1a1a;
    }

    .dialog-subtitle {
      margin: 0;
      color: #6c757d;
    }

    .todo-form {
      display: flex;
      flex-direction: column;
      gap: var(--md-sys-spacing-md);
      padding: var(--md-sys-spacing-md) 0;
    }

    .full-width {
      width: 100%;
    }

    .priority-option {
      padding: var(--md-sys-spacing-xs) var(--md-sys-spacing-sm);
      border-radius: var(--md-sys-shape-corner-large);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-option.niedrig {
      background-color: var(--priority-low-container);
      color: var(--priority-low);
    }

    .priority-option.mittel {
      background-color: var(--priority-medium-container);
      color: var(--priority-medium);
    }

    .priority-option.hoch {
      background-color: var(--priority-high-container);
      color: var(--priority-high);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--md-sys-spacing-sm);
      padding: var(--md-sys-spacing-md) 0 0 0;
      margin: 0;
      border-top: 1px solid #e9ecef;
    }

    .cancel-button {
      color: #6c757d;
      border-radius: var(--md-sys-shape-corner-large);
    }

    .save-button {
      border-radius: var(--md-sys-shape-corner-large);
      display: flex;
      align-items: center;
      gap: var(--md-sys-spacing-xs);
    }

    /* Form field enhancements */
    .mat-mdc-form-field {
      .mat-mdc-form-field-outline {
        border-radius: var(--md-sys-shape-corner-medium);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .dialog-container {
        min-width: 300px;
        max-width: 90vw;
      }

      .dialog-header {
        flex-direction: column;
        text-align: center;
        gap: var(--md-sys-spacing-sm);
      }

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .header-icon mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .dialog-actions {
        flex-direction: column;
        gap: var(--md-sys-spacing-sm);
      }
    }
  `]
})
export class TodoFormDialogComponent implements OnInit {
  todoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TodoFormData,
    private snackBar: MatSnackBar
  ) {
    this.todoForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.todo) {
      this.populateForm(this.data.todo);
    }
  }

  /**
   * Creates the reactive form with validation rules
   */
  private createForm(): FormGroup {
    return this.fb.group({
      titel: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      beschreibung: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      priority: ['', [Validators.required]],
      endeAm: ['', [
        Validators.required,
        this.futureDateValidator
      ]]
    });
  }

  /**
   * Custom validator to ensure due date is in the future
   */
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }

  /**
   * Populates the form with existing todo data for editing
   */
  private populateForm(todo: Todo): void {
    this.todoForm.patchValue({
      titel: todo.titel,
      beschreibung: todo.beschreibung,
      priority: todo.priority,
      endeAm: todo.endeAm
    });
  }

  /**
   * Handles form submission and validation
   */
  onSave(): void {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      
      // Log successful form submission
      console.log('Todo form submitted successfully:', {
        mode: this.data.mode,
        formData: formValue,
        timestamp: new Date().toISOString()
      });

      this.dialogRef.close({
        ...formValue,
        id: this.data.mode === 'edit' ? this.data.todo?.id : undefined
      });
    } else {
      this.logValidationErrors();
      this.snackBar.open('Bitte korrigieren Sie die Eingabefehler', 'Schließen', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
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

  /**
   * Handles dialog cancellation
   */
  onCancel(): void {
    console.log('Todo form dialog cancelled');
    this.dialogRef.close();
  }
}
