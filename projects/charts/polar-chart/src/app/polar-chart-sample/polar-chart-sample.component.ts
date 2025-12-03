import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { THEME_TOKEN, ThemeToken } from 'igniteui-angular/core';
import {
  IgxCategoryChartModule,
  IgxDataChartAnnotationModule,
  IgxDataChartCoreModule,
  IgxDataChartInteractivityModule,
  IgxDataChartPolarCoreModule,
  IgxDataChartPolarModule,
  IgxLegendModule
} from 'igniteui-angular-charts';

@Component({
  selector: 'app-polar-chart-sample',
  standalone: true,
  providers: [
    {
      provide: THEME_TOKEN,
      useFactory: () => {
        return new ThemeToken('material');
      },
    },
  ],
  imports: [
    IgxCategoryChartModule,
    IgxDataChartCoreModule,
    IgxDataChartPolarModule,
    IgxDataChartPolarCoreModule,
    IgxDataChartInteractivityModule,
    IgxDataChartAnnotationModule,
    IgxLegendModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './polar-chart-sample.component.html',
  styleUrl: './polar-chart-sample.component.scss'
})
export class PolarChartDemoComponent {

  public boatSailingData = [
    { direction: 0, boatSpeed: 70, windSpeed: 90 },
    { direction: 45, boatSpeed: 35, windSpeed: 65 },
    { direction: 90, boatSpeed: 25, windSpeed: 45 },
    { direction: 135, boatSpeed: 15, windSpeed: 25 },
    { direction: 180, boatSpeed: 0, windSpeed: 0 },
    { direction: 225, boatSpeed: 15, windSpeed: 25 },
    { direction: 270, boatSpeed: 25, windSpeed: 45 },
    { direction: 315, boatSpeed: 35, windSpeed: 65 },
    { direction: 360, boatSpeed: 70, windSpeed: 90 }
  ];
}

