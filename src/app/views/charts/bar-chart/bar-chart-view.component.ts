import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from 'projects/charts/bar-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'bar-chart-view',
  templateUrl: './bar-chart-view.component.html',
  styleUrl: './bar-chart-view.component.scss',
  imports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarChartViewComponent {}
