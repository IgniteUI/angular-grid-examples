import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/charts/column-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'column-chart-view',
  templateUrl: './column-chart-view.component.html',
  styleUrl: './column-chart-view.component.scss',
  imports: [AppComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ColumnChartViewComponent {}
