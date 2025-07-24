import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import {
  IgxCategoryChartModule,
  IgxDataChartAnnotationModule,
  IgxDataChartComponent,
  IgxDataChartCoreModule,
  IgxDataChartInteractivityModule,
  IgxDataChartPolarCoreModule,
  IgxDataChartPolarModule,
  IgxLegendComponent,
  IgxLegendModule,
  IgxNumericAngleAxisComponent,
  IgxNumericRadiusAxisComponent,
  IgxPolarAreaSeriesComponent
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
    CommonModule,
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
  @ViewChild("legend", { static: true })
  public legend!: IgxLegendComponent;
  @ViewChild("chart", { static: true })
  public chart!: IgxDataChartComponent;
  @ViewChild("angleAxis", { static: true })
  public angleAxis!: IgxNumericAngleAxisComponent;
  @ViewChild("radiusAxis", { static: true })
  public radiusAxis!: IgxNumericRadiusAxisComponent;
  @ViewChild("polarAreaSeries1", { static: true })
  public polarAreaSeries1!: IgxPolarAreaSeriesComponent;
  @ViewChild("polarAreaSeries2", { static: true })
  public polarAreaSeries2!: IgxPolarAreaSeriesComponent;

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

