import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="search-section">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Suche Aufgaben</mat-label>
        <input matInput placeholder="Titel oder Beschreibung eingeben..." (input)="onInput($event)" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>
  `
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }
}


