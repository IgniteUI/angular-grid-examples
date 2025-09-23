import { Component, Input, ViewChild } from '@angular/core';
import {
  IgxCategoryXAxisComponent,
  IgxCategoryXAxisModule,
  IgxColumnSeriesModule,
  IgxDataChartComponent,
  IgxDataChartCoreModule,
  IgxNumericYAxisComponent,
  IgxNumericYAxisModule
} from 'igniteui-angular-charts';


@Component({
    selector: 'sales-trends-chart',
    styleUrls: ['./sales-trends-chart.component.scss'],
    templateUrl: './sales-trends-chart.component.html',
    imports: [
      IgxDataChartCoreModule,
      IgxCategoryXAxisModule,
      IgxNumericYAxisModule,
      IgxColumnSeriesModule
    ]
})
export class SalesTrendsChartComponent  {
    @ViewChild('xAxis', { static: true }) public xAxis!: IgxCategoryXAxisComponent;
    @ViewChild('yAxis', { static: true }) public yAxis!: IgxNumericYAxisComponent;
    @ViewChild('chart', { static: true }) public chart!: IgxDataChartComponent;

    @Input()
    public dataSource: any;
}
