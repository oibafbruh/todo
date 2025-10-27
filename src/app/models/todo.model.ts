export type Priority = 'niedrig' | 'mittel' | 'hoch';

export interface Todo {
  id: number;
  titel: string;
  beschreibung: string;
  priority: Priority;
  erledigt: boolean;
  erstelltAm: Date;
  endeAm: Date;
}

// Filter and UI interfaces
export interface FilterState {
  search: string;
  status: 'alle' | 'offen' | 'erledigt';
  priority: Priority | 'alle';
  sortBy: 'erstelltAm' | 'endeAm' | 'priority' | 'titel';
  sortOrder: 'asc' | 'desc';
}

export interface TodoFormData {
  mode: 'create' | 'edit';
  todo?: Todo;
}