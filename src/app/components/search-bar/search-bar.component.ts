import { Component, EventEmitter, Output } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { timer } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: `./search.html`
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  @Output() debounceTime = new EventEmitter<number>();

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  onTimerInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const ms = Number(val) || 300;
    this.debounceTime.emit(ms);
  }
}


