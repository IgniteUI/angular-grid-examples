import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { StepChartDemoComponent } from './step-chart-sample/step-chart-sample.component';

@Component({
  selector: 'app-step-chart',
  standalone: true,
  imports: [StepChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
