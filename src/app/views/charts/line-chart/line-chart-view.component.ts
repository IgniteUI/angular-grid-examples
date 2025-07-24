import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from 'projects/charts/line-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'line-chart-view',
  templateUrl: './line-chart-view.component.html',
  styleUrl: './line-chart-view.component.scss',
  imports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LineChartViewComponent {}
