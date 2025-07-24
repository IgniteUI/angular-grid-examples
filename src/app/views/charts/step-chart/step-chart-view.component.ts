import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from 'projects/charts/step-chart/src/app/app.component';

@Component({
  standalone: true,
  selector: 'step-chart-view',
  templateUrl: './step-chart-view.component.html',
  styleUrl: './step-chart-view.component.scss',
  imports: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StepChartViewComponent {}
