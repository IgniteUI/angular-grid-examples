import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/sales-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'sales-view',
  imports: [AppComponent],
  templateUrl: './sales-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sales-view.component.scss',
})
export class SalesViewComponent {}
