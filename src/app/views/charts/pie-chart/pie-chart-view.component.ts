import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from 'projects/charts/pie-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'pie-chart-view',
  templateUrl: './pie-chart-view.component.html',
  styleUrl: './pie-chart-view.component.scss',
  imports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PieChartViewComponent {}
