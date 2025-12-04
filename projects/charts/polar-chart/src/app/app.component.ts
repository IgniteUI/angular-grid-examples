import { Component, ViewEncapsulation } from '@angular/core';

import { PolarChartDemoComponent } from './polar-chart-sample/polar-chart-sample.component';

@Component({
  selector: 'app-polar-chart',
  standalone: true,
  imports: [PolarChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
