import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/charts/polar-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'polar-chart-view',
  templateUrl: './polar-chart-view.component.html',
  styleUrl: './polar-chart-view.component.scss',
  imports: [AppComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PolarChartViewComponent {}
