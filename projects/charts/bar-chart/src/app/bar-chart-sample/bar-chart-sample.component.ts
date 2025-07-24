import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import { IgxBarSeriesComponent, IgxBarSeriesModule, IgxCategoryHighlightLayerComponent, IgxCategoryHighlightLayerModule, IgxCategoryYAxisComponent, IgxCategoryYAxisModule, IgxDataChartAnnotationModule, IgxDataChartCategoryCoreModule, IgxDataChartCategoryModule, IgxDataChartComponent, IgxDataChartCoreModule, IgxDataChartInteractivityModule, IgxDataChartVerticalCategoryModule, IgxDataToolTipLayerComponent, IgxDataToolTipLayerModule, IgxLegendComponent, IgxLegendModule, IgxNumericXAxisComponent, IgxNumericXAxisModule } from 'igniteui-angular-charts';

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
    CommonModule,
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
  @ViewChild("legend", { static: true })
  public legend!: IgxLegendComponent;
  @ViewChild("chart", { static: true })
  public chart!: IgxDataChartComponent;
  @ViewChild("yAxis", { static: true })
  public yAxis!: IgxCategoryYAxisComponent;
  @ViewChild("xAxis", { static: true })
  public xAxis!: IgxNumericXAxisComponent;
  @ViewChild("categoryHighlightLayer", { static: true })
  public categoryHighlightLayer!: IgxCategoryHighlightLayerComponent;
  @ViewChild("barSeries1", { static: true })
  public barSeries1!: IgxBarSeriesComponent;
  @ViewChild("barSeries2", { static: true })
  public barSeries2!: IgxBarSeriesComponent;
  @ViewChild("tooltips", { static: true })
  public tooltips!: IgxDataToolTipLayerComponent;

  public highestGrossingMovies = [
    { franchise: 'Marvel Universe', totalRevenue: 22.55, highestGrossing: 2.8 },
    { franchise: 'Star Wars', totalRevenue: 10.32, highestGrossing: 2.07 },
    { franchise: 'Harry Potter', totalRevenue: 9.19, highestGrossing: 1.34 },
    { franchise: 'Avengers', totalRevenue: 7.76, highestGrossing: 2.8 },
    { franchise: 'Spider Man', totalRevenue: 7.22, highestGrossing: 1.28 },
    { franchise: 'James Bond', totalRevenue: 7.12, highestGrossing: 1.11 }
  ];
}

