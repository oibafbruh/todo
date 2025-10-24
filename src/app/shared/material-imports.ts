import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Core
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

/**
 * Gemeinsame Angular Material Imports für Todo-Komponenten
 */
export const MATERIAL_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatChipsModule,
  MatMenuModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatDividerModule,
  MatTableModule,
  MatSortModule,
  MatDatepickerModule,
  MatNativeDateModule
];

/**
 * Basis-Material Imports (ohne erweiterte Features)
 */
export const BASIC_MATERIAL_IMPORTS = [
  CommonModule,
  FormsModule,
  MatTableModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatChipsModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatMenuModule,
  MatDividerModule,
  MatCardModule
];

/**
 * Layout-spezifische Material Imports
 */
export const LAYOUT_MATERIAL_IMPORTS = [
  ...MATERIAL_IMPORTS
];
