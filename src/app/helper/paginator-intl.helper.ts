import { Inject, Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";


@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Aufgaben pro Seite:';
  override nextPageLabel = 'Nächste Seite';
  override previousPageLabel = 'Vorherige Seite'
}