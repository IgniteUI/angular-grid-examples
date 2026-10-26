import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { LineChartDemoComponent } from './line-chart-sample/line-chart-sample.component';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [LineChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
