import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, TodoItemComponent],
  template: `
    <div class="aufgaben-container">
      <div class="list-header">
        <h2>
          Aufgaben
          <span class="count-badge">{{ todos?.length || 0 }}</span>
        </h2>
      </div>

      <div cdkDropList [cdkDropListLockAxis]="'y'" [cdkDropListAutoScrollStep]="2" (cdkDropListDropped)="onDrop($event)" class="todo-list">
        <ng-container *ngIf="todos?.length; else empty">
          <ng-container *ngFor="let todo of todos; trackBy: trackById">
            <app-todo-item 
              [todo]="todo"
              (toggle)="toggle.emit($event)"
              (save)="save.emit($event)"
              (cancel)="cancel.emit()"
              (delete)="delete.emit($event)">
            </app-todo-item>
          </ng-container>
        </ng-container>
      </div>

      <ng-template #empty>
        <div class="empty-state">
          <h3>Keine Aufgaben gefunden</h3>
          <p>Wenn du eine Aufgabe erstellst, kannst du sie hier sehen</p>
        </div>
      </ng-template>
    </div>
  `
})
export class TodoListComponent {
  @Input() todos: Todo[] | null = [];
  @Output() reorder = new EventEmitter<Todo[]>();
  @Output() toggle = new EventEmitter<number>();
  @Output() save = new EventEmitter<{ id: number; titel: string; beschreibung: string; priority: 'niedrig'|'mittel'|'hoch'; endeAm: Date }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();

  onDrop(event: CdkDragDrop<Todo[]>) {
    if (!this.todos) return;
    const reordered = [...this.todos];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.reorder.emit(reordered);
  }

  trackById(_: number, t: Todo) { return t.id; }
}


