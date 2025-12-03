import { Component, ViewEncapsulation } from '@angular/core';

import { ColumnChartDemoComponent } from './column-chart-sample/column-chart-sample.component';

@Component({
  selector: 'app-column-chart',
  standalone: true,
  imports: [ColumnChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
