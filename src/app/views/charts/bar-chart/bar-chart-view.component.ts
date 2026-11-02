import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/charts/bar-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'bar-chart-view',
  templateUrl: './bar-chart-view.component.html',
  styleUrl: './bar-chart-view.component.scss',
  imports: [AppComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarChartViewComponent {}
