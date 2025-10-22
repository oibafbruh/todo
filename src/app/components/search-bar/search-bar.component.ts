import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { timer } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="search-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Suche Aufgaben</mat-label>
        <input matInput 
        placeholder="Titel oder Beschreibung eingeben..." 
        (input)="onSearchInput($event)" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="number">
        <mat-label>Debug Debounce Timer</mat-label>
        <input matInput 
        placeholder="300" 
        (input)="onTimerInput($event)" />
      </mat-form-field>

    </div>
  `
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


