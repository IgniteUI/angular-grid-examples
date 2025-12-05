import { Component, ViewEncapsulation } from '@angular/core';

import { BarChartDemoComponent } from './bar-chart-sample/bar-chart-sample.component';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [BarChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
