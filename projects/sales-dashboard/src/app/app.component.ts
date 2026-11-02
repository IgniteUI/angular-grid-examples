import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';

@Component({
  selector: 'app-sales-dashboard',
  imports: [SalesDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
