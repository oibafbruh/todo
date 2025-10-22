import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  template: `
    <div class="filter-section">
      <div class="filter-group">
        <label class="filter-label">Status:</label>
        <mat-chip-listbox class="filter-chips">
          <mat-chip-option [selected]="status === 'alle'" (click)="statusChange.emit('alle')">Alle</mat-chip-option>
          <mat-chip-option [selected]="status === 'offen'" (click)="statusChange.emit('offen')">Offen</mat-chip-option>
          <mat-chip-option [selected]="status === 'erledigt'" (click)="statusChange.emit('erledigt')">Erledigt</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <div class="filter-group">
        <label class="filter-label">Priorität:</label>
        <mat-chip-listbox class="filter-chips">
          <mat-chip-option [selected]="priority === 'alle'" (click)="priorityChange.emit('alle')">Alle</mat-chip-option>
          <mat-chip-option [selected]="priority === 'hoch'" (click)="priorityChange.emit('hoch')" class="chip-hoch">Hoch</mat-chip-option>
          <mat-chip-option [selected]="priority === 'mittel'" (click)="priorityChange.emit('mittel')" class="chip-mittel">Mittel</mat-chip-option>
          <mat-chip-option [selected]="priority === 'niedrig'" (click)="priorityChange.emit('niedrig')" class="chip-niedrig">Niedrig</mat-chip-option>
        </mat-chip-listbox>
      </div>
    </div>
  `
})
export class FilterBarComponent {
  @Input() status: 'alle'|'offen'|'erledigt' = 'alle';
  @Input() priority: 'alle'|'niedrig'|'mittel'|'hoch' = 'alle';
  @Output() statusChange = new EventEmitter<'alle'|'offen'|'erledigt'>();
  @Output() priorityChange = new EventEmitter<'alle'|'niedrig'|'mittel'|'hoch'>();
}


