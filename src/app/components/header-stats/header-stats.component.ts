import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="header">
      <h1><mat-icon>check_box</mat-icon> Angular To-Do App</h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ total || 0 }}</span>
          <span class="stat-label">Gesamt</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ open || 0 }}</span>
          <span class="stat-label">Offen</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ done || 0 }}</span>
          <span class="stat-label">Erledigt</span>
        </div>
      </div>
    </header>
  `
})
export class HeaderStatsComponent {
  // Total number of todos provided by the container
  @Input() total: number | null = 0;
  // Number of open todos provided by the container
  @Input() open: number | null = 0;
  // Number of completed todos provided by the container
  @Input() done: number | null = 0;
}


