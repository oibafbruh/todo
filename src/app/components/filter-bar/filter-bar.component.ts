import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: `./filter.html`
})
export class FilterBarComponent {
  @Input() status: 'alle'|'offen'|'erledigt' = 'alle';
  @Input() priority: 'alle'|'niedrig'|'mittel'|'hoch' = 'alle';
  @Output() statusChange = new EventEmitter<'alle'|'offen'|'erledigt'>();
  @Output() priorityChange = new EventEmitter<'alle'|'niedrig'|'mittel'|'hoch'>();
}


