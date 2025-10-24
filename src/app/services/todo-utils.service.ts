import { Injectable } from '@angular/core';
import { Todo, Priority } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoUtilsService {

  /**
   * Konvertiert Priorität zu lesbarem Text
   */
  getPriorityLabel(priority: Priority): string {
    const labels = {
      niedrig: 'Niedrig',
      mittel: 'Mittel',
      hoch: 'Hoch'
    };
    return labels[priority];
  }

  /**
   * Prüft ob Todo überfällig ist
   */
  isOverdue(todo: Todo): boolean {
    return !todo.erledigt && new Date(todo.endeAm) < new Date();
  }

  /**
   * Kürzt Beschreibung ab
   */
  getTruncatedDescription(description: string, maxLength: number = 50): string {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  /**
   * Formatiert Datum für Anzeige
   */
  formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const dateObj = new Date(date);
    if (format === 'short') {
      return dateObj.toLocaleDateString('de-DE');
    } else {
      return dateObj.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Generiert CSS-Klassen für Todo-Status
   */
  getTodoRowClasses(todo: Todo): string[] {
    const classes: string[] = [];
    
    if (todo.erledigt) {
      classes.push('completed-row');
    }
    
    if (this.isOverdue(todo)) {
      classes.push('overdue-row');
    }
    
    return classes;
  }

  /**
   * Generiert CSS-Klassen für Prioritäts-Chips
   */
  getPriorityChipClass(priority: Priority): string {
    return `priority-chip priority-${priority}`;
  }

  /**
   * Validiert ob Datum in der Zukunft liegt
   */
  isFutureDate(date: Date | string): boolean {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj >= today;
  }

  /**
   * Berechnet verbleibende Tage bis Fälligkeit
   */
  getDaysUntilDue(todo: Todo): number {
    const dueDate = new Date(todo.endeAm);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generiert Tooltip-Text für Todo
   */
  getTodoTooltip(todo: Todo): string {
    const daysUntilDue = this.getDaysUntilDue(todo);
    let tooltip = `Titel: ${todo.titel}\nBeschreibung: ${todo.beschreibung}`;
    
    if (this.isOverdue(todo)) {
      tooltip += '\n⚠️ Überfällig!';
    } else if (daysUntilDue <= 3) {
      tooltip += `\n⏰ Fällig in ${daysUntilDue} Tag${daysUntilDue !== 1 ? 'en' : ''}`;
    }
    
    return tooltip;
  }
}
