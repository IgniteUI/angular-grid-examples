import { Component } from '@angular/core';
import { AppComponent } from 'projects/grids/sales-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'sales-view',
  imports: [AppComponent],
  templateUrl: './sales-view.component.html',
  styleUrl: './sales-view.component.scss',
})
export class SalesViewComponent {}
