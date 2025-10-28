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

import { Todo, TodoFormData } from '../../models/todo.model';
import { TodoUtilsService } from '../../services/todo-utils.service';


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
  templateUrl: `./todo-edit.component.html`,
  styleUrls: [`./todo-edit.component.css`]
})
export class TodoEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<TodoEditComponent>>(MatDialogRef);
  data = inject<TodoFormData>(MAT_DIALOG_DATA);
  private snackBar = inject(MatSnackBar);
  private utilsService = inject(TodoUtilsService);

  todoForm!: FormGroup;

  ngOnInit(): void {
    console.log('ng init data:', this.data);
    this.todoForm = this.createForm();
    if (this.data.mode === 'edit' && this.data.todo) {
      console.log('populating data:', this.data.todo);
      // Use setTimeout to ensure form is fully initialized
      setTimeout(() => {
        this.populateForm(this.data.todo!);
      }, 0);
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
        Validators.maxLength(500)
      ]],
      priority: ['', [Validators.required]],
      endeAm: ['', [
        //Daniel Fragen!
        Validators.required,   
        this.utilsService.futureDateValidator
      ]]
    });
  }

  //validator für datum muss in zukunft liegen


  private populateForm(todo: Todo): void {
    // chatgpt hilfe
    const endeAmDate = todo.endeAm instanceof Date 
      ? todo.endeAm 
      : new Date(todo.endeAm);

    const formData = {
      titel: todo.titel,
      beschreibung: todo.beschreibung,
      priority: todo.priority,
      endeAm: endeAmDate
    };
    
    console.log('form values:', formData);
    this.todoForm.patchValue(formData);
    console.log('form values afterr patch:', this.todoForm.value);
  }

  //form submission und validation
  onSave(): void {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      
      console.log('erfolgreich gespeichert:', {
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
      this.snackBar.open('Bitte Eingabefehler korrigieren.', 'Schließen', {
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

    console.error('validation errors:', {
      errors,
      formValue: this.todoForm.value,
      timestamp: new Date().toISOString()
    });
  }

  onCancel(): void {
    console.log('dialog cancelled');
    this.dialogRef.close();
  }
}
