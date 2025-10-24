import { Priority, Todo } from '../models/todo.model';

/**
 * Einheitliches Filter-Interface für alle Todo-Komponenten
 */
export interface FilterState {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';
  sortOrder: 'asc' | 'desc';
}

/**
 * Interface für Tabellen-spezifische Sortierung
 */
export interface TableSort {
  active: string;
  direction: 'asc' | 'desc';
}

/**
 * Interface für Tabellen-spezifische Filter (vereinfacht)
 */
export interface TableFilter {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
}

/**
 * Interface für Todo-Formular-Daten
 */
export interface TodoFormData {
  mode: 'create' | 'edit';
  todo?: Todo;
}

/**
 * Interface für Todo-Events
 */
export interface TodoEvents {
  create: (todo: Omit<Todo, 'id' | 'erstelltAm'>) => void;
  update: (todo: Todo) => void;
  delete: (id: number) => void;
  toggle: (id: number) => void;
}

/**
 * Interface für Filter-Controls
 */
export interface FilterControls {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';
  sortOrder: 'asc' | 'desc';
}

/**
 * Interface für UI-State
 */
export interface UIState {
  isLoading: boolean;
  showFilters: boolean;
  isCreatingNew: boolean;
}
