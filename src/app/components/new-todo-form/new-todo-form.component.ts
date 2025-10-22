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
  selector: 'app-new-todo-form',
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
  template: `
    <div class="card neue-aufgabe-card">
      <div class="card-header">
        <h3>Neue Aufgabe erstellen</h3>
      </div>
      <div class="card-body">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="flex-2">
            <mat-label>Titel</mat-label>
            <input matInput formControlName="titel" placeholder="z.B. ToDo App in Angular erstellen" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Beschreibung</mat-label>
            <textarea matInput rows="3" formControlName="beschreibung"></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Priorität</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="niedrig">Niedrig</mat-option>
                <mat-option value="mittel">Mittel</mat-option>
                <mat-option value="hoch">Hoch</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>Enddatum</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="endeAm" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button type="submit" mat-raised-button color="primary">Aufgabe hinzufügen</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class NewTodoFormComponent {
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


