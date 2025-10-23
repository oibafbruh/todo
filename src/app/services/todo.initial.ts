import { Todo } from '../models/todo.model';

export const initialTodos: Todo[] = [
  { 
    id: 1, titel: 'Ausschlafen am Wochenende', 
    beschreibung: 'Das ist eine Aufgabe mit hoher Priorität', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 16, 16, 12), 
    endeAm: new Date(2025, 9, 28, 12, 71) 
},
  { 
    id: 2, 
    titel: 'Docker Network verstehen', 
    beschreibung: 'Subnetze zwischen Containern und Traefik Proxy', 
    priority: 'mittel', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 15, 15, 32), 
    endeAm: new Date(2025, 9, 21, 13, 58) 
},
  { 
    id: 3, 
    titel: 'Angular Tutorial abschließen', 
    beschreibung: 'Hello World und Häuser App', 
    priority: 'niedrig', 
    erledigt: true, 
    erstelltAm: new Date(2025, 9, 13, 9, 58), 
    endeAm: new Date(2025, 10, 24, 6, 15) 
},
  { 
    id: 4, 
    titel: 'Wochenmeeting beitreten', 
    beschreibung: 'Donnerstag 09:00 - 09:45', 
    priority: 'mittel', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 15, 17, 8), 
    endeAm: new Date(2025, 9, 30, 15, 32) 
}
];
