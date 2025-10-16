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
