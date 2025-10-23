import { Todo } from '../models/todo.model';
//export als constant array
export const initialTodos: Todo[] = [
  { 
    id: 1, 
    titel: 'Ausschlafen am Wochenende', 
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
  },
  { 
    id: 5, 
    titel: 'Wäsche waschen', 
    beschreibung: 'Weiße Wäsche separat waschen', 
    priority: 'niedrig', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 20, 18, 12), 
    endeAm: new Date(2025, 9, 21, 11, 0) 
  },
  { 
    id: 6, 
    titel: 'Fitnessstudio besuchen', 
    beschreibung: 'Beintraining und Ausdauer', 
    priority: 'mittel', 
    erledigt: true, 
    erstelltAm: new Date(2025, 9, 10, 8, 22), 
    endeAm: new Date(2025, 9, 19, 19, 0) 
  },
  { 
    id: 7, 
    titel: 'Arzttermin vereinbaren', 
    beschreibung: 'Hausarzttermin zur Routinekontrolle', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 18, 9, 15), 
    endeAm: new Date(2025, 9, 25, 10, 30) 
  },
  { 
    id: 8, 
    titel: 'Projektplan aktualisieren', 
    beschreibung: 'Neue Milestones für das Backend hinzufügen', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 12, 14, 10), 
    endeAm: new Date(2025, 9, 22, 17, 0) 
  },
  { 
    id: 9, 
    titel: 'GitHub Repository aufräumen', 
    beschreibung: 'Branches mergen und alte löschen', 
    priority: 'mittel', 
    erledigt: true, 
    erstelltAm: new Date(2025, 9, 14, 16, 40), 
    endeAm: new Date(2025, 9, 20, 12, 0) 
  },
  { 
    id: 10, 
    titel: 'Lebensmittel einkaufen', 
    beschreibung: 'Gemüse, Reis, Milch, Haferflocken', 
    priority: 'niedrig', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 19, 10, 0), 
    endeAm: new Date(2025, 9, 19, 18, 0) 
  },
  { 
    id: 11, 
    titel: 'Steuerunterlagen sortieren', 
    beschreibung: 'Belege und Rechnungen für 2025 vorbereiten', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 17, 11, 45), 
    endeAm: new Date(2025, 10, 5, 17, 0) 
  },
  { 
    id: 12, 
    titel: 'Neue Musik entdecken', 
    beschreibung: 'Spotify Playlist für Herbst erstellen', 
    priority: 'niedrig', 
    erledigt: true, 
    erstelltAm: new Date(2025, 9, 8, 19, 30), 
    endeAm: new Date(2025, 9, 12, 20, 0) 
  },
  { 
    id: 13, 
    titel: 'Code-Review durchführen', 
    beschreibung: 'Pull Request #42 prüfen und kommentieren', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 21, 9, 0), 
    endeAm: new Date(2025, 9, 22, 12, 0) 
  },
  { 
    id: 14, 
    titel: 'Geburtstagsgeschenk besorgen', 
    beschreibung: 'Buch und Blumen für Sophie kaufen', 
    priority: 'hoch', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 15, 13, 25), 
    endeAm: new Date(2025, 9, 25, 19, 0) 
  },
  { 
    id: 15, 
    titel: 'React Hooks auffrischen', 
    beschreibung: 'useEffect und useMemo Beispiele durchgehen', 
    priority: 'mittel', 
    erledigt: false, 
    erstelltAm: new Date(2025, 9, 16, 18, 40), 
    endeAm: new Date(2025, 9, 30, 21, 0) 
  }
];
