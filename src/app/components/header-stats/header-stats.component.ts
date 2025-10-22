import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: `./header.html`
})
export class HeaderStatsComponent {
  // Total 
  @Input() total: number | null = 0;
  // Offen
  @Input() open: number | null = 0;
  // Erledigt
  @Input() done: number | null = 0;
}


