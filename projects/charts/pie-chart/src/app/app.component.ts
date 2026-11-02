import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { PieChartDemoComponent } from './pie-chart-sample/pie-chart-sample.component';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [PieChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
