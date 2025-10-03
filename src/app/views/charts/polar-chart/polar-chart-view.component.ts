import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from 'projects/charts/polar-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'polar-chart-view',
  templateUrl: './polar-chart-view.component.html',
  styleUrl: './polar-chart-view.component.scss',
  imports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolarChartViewComponent {}
