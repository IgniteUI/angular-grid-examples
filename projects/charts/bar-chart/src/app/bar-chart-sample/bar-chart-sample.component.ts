import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { THEME_TOKEN, ThemeToken } from 'igniteui-angular/core';
import { IgxBarSeriesModule, IgxCategoryHighlightLayerModule, IgxCategoryYAxisModule, IgxDataChartAnnotationModule, IgxDataChartCategoryCoreModule, IgxDataChartCategoryModule, IgxDataChartCoreModule, IgxDataChartInteractivityModule, IgxDataChartVerticalCategoryModule, IgxDataToolTipLayerModule, IgxLegendModule, IgxNumericXAxisModule } from 'igniteui-angular-charts';

@Component({
  selector: 'app-bar-chart-sample',
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
    IgxLegendModule,
    IgxDataChartCoreModule,
    IgxDataChartCategoryCoreModule,
    IgxDataChartCategoryModule,
    IgxDataChartInteractivityModule,
    IgxDataChartVerticalCategoryModule,
    IgxDataChartAnnotationModule,
    IgxCategoryYAxisModule,
    IgxNumericXAxisModule,
    IgxBarSeriesModule,
    IgxCategoryHighlightLayerModule,
    IgxDataToolTipLayerModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bar-chart-sample.component.html',
  styleUrl: './bar-chart-sample.component.scss'
})
export class BarChartDemoComponent {

  public highestGrossingMovies = [
    { franchise: 'Marvel Universe', totalRevenue: 22.55, highestGrossing: 2.8 },
    { franchise: 'Star Wars', totalRevenue: 10.32, highestGrossing: 2.07 },
    { franchise: 'Harry Potter', totalRevenue: 9.19, highestGrossing: 1.34 },
    { franchise: 'Avengers', totalRevenue: 7.76, highestGrossing: 2.8 },
    { franchise: 'Spider Man', totalRevenue: 7.22, highestGrossing: 1.28 },
    { franchise: 'James Bond', totalRevenue: 7.12, highestGrossing: 1.11 }
  ];
}

