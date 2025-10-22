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
  templateUrl: `./dialog.html`,
  styleUrls: [`./dialog.css`]
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
