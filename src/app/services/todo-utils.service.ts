import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Priority } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoUtilsService {

  //constructor() { }
  
  futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }

  getPriorityLabel(priority: Priority): string {
    const labels = {
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];
  }

  logValidationErrors(form: any, context: string = 'Form'): void {
    const errors: Record<string, unknown> = {};
    
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });

    console.error(`${context} validation errors:`, {
      errors,
      formValue: form.value,
    });
  }
}
