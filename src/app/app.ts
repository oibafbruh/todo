import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TodoLayoutComponent } from './components/todo-layout/todo-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TodoLayoutComponent
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
}
