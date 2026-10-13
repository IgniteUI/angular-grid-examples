import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/charts/line-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'line-chart-view',
  templateUrl: './line-chart-view.component.html',
  styleUrl: './line-chart-view.component.scss',
  imports: [AppComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LineChartViewComponent {}
