import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/sales-dashboard/src/app/app.component';

@Component({
  standalone: true,
  selector: 'sales-dashboard-view',
  imports: [AppComponent],
  templateUrl: './sales-dashboard-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sales-dashboard-view.component.scss'
})
export class SalesDashboardViewComponent {
}
