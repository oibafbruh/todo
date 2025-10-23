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
  templateUrl: './todo-item.component.html'
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
    // FormBuilder init
    this.form = this.fb.group({
      titel: ['', [Validators.required, Validators.minLength(1)]],
      beschreibung: [''],
      priority: ['mittel' as 'niedrig'|'mittel'|'hoch', [Validators.required]],
      endeAm: [new Date(), [Validators.required]]
    });

    this.form.statusChanges.subscribe(status => {
      if (status === 'INVALID') {
        console.group('Edit Todo Form Errors');
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


