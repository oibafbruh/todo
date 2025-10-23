import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: `./todo-filter.component.html`
})
export class TodoFilterComponent {
  @Input() status: 'alle'|'offen'|'erledigt' = 'alle';
  @Input() priority: 'alle'|'niedrig'|'mittel'|'hoch' = 'alle';
  @Output() statusChange = new EventEmitter<'alle'|'offen'|'erledigt'>();
  @Output() priorityChange = new EventEmitter<'alle'|'niedrig'|'mittel'|'hoch'>();
}
