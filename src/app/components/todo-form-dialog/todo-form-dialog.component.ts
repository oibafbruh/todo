import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Todo } from '../../models/todo.model';

export interface TodoFormData {
  todo?: Todo;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-todo-form-dialog',
  standalone: true,
  imports: [
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
  providers: [provideNativeDateAdapter()],
  templateUrl: `./todo-form-dialog.component.html`,
  styleUrls: [`./todo-form-dialog.component.css`]
})
export class TodoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<TodoFormDialogComponent>>(MatDialogRef);
  data = inject<TodoFormData>(MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);

  todoForm: FormGroup = this.createForm();

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.todo) {
      this.populateForm(this.data.todo);
    }
  }

  //neues reactive form mit validatoren
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

  //validadator für datum muss in zukunft liegen
  private futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }


  private populateForm(todo: Todo): void {
    // chatgpt hilfe
    const endeAmDate = todo.endeAm instanceof Date 
      ? todo.endeAm 
      : new Date(todo.endeAm);

    this.todoForm.patchValue({
      titel: todo.titel,
      beschreibung: todo.beschreibung,
      priority: todo.priority,
      endeAm: endeAmDate
    });
  }

  //form submission und validation
  onSave(): void {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      
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

  private logValidationErrors(): void {
    const errors: Record<string, unknown> = {};
    
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

  onCancel(): void {
    console.log('Todo form dialog cancelled');
    this.dialogRef.close();
  }
}
