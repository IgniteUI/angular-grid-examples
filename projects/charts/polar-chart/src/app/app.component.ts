import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { PolarChartDemoComponent } from './polar-chart-sample/polar-chart-sample.component';

@Component({
  selector: 'app-polar-chart',
  standalone: true,
  imports: [PolarChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
