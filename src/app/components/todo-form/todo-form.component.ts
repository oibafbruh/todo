import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './todo-form.component.html'
})
export class TodoFormComponent {
  @Output() create = new EventEmitter<{ titel: string; beschreibung: string; priority: 'niedrig'|'mittel'|'hoch'; endeAm: Date }>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    // Form Builder init
    this.form = this.fb.group({
      titel: ['', [Validators.required, Validators.minLength(1)]],
      beschreibung: [''],
      priority: ['mittel' as 'niedrig'|'mittel'|'hoch', [Validators.required]],
      endeAm: [this.defaultDueDate(), [Validators.required]]
    });

    // Validierungfehler zur Console
    this.form.statusChanges.subscribe(status => {
      if (status === 'INVALID') {
        console.group('New Todo Form Errors');
        Object.entries(this.form.controls).forEach(([key, ctrl]) => {
          if (ctrl.errors) console.error(`${key}:`, ctrl.errors);
        });
        console.log("I am an error!");
        console.groupEnd();
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.create.emit(this.form.value as any);
    this.form.reset({ titel: '', beschreibung: '', priority: 'mittel', endeAm: this.defaultDueDate() });
  }

  private defaultDueDate(): Date {
    return new Date(new Date().setDate(new Date().getDate() + 7));
  }
}
