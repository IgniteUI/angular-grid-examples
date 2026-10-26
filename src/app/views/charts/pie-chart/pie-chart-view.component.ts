import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/charts/pie-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'pie-chart-view',
  templateUrl: './pie-chart-view.component.html',
  styleUrl: './pie-chart-view.component.scss',
  imports: [AppComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PieChartViewComponent {}
