import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import { IgxCategoryChartComponent, IgxCategoryChartModule, IgxLegendComponent, IgxLegendModule } from 'igniteui-angular-charts';

@Component({
  selector: 'app-line-chart-sample',
  standalone: true,
  providers: [
    {
      provide: THEME_TOKEN,
      useFactory: () => {
        return new ThemeToken('material');
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IgxCategoryChartModule,
    IgxLegendModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './line-chart-sample.component.html',
  styleUrl: './line-chart-sample.component.scss'
})
export class LineChartDemoComponent {
  @ViewChild("legend", { static: true })
  public legend!: IgxLegendComponent;
  @ViewChild("chart", { static: true })
  public chart!: IgxCategoryChartComponent;

  public countryRenewableElectricity = [
    { year: '2009', europe: 34, china: 21, america: 19 },
    { year: '2010', europe: 43, china: 26, america: 24 },
    { year: '2011', europe: 66, china: 29, america: 28 },
    { year: '2012', europe: 69, china: 32, america: 26 },
    { year: '2013', europe: 58, china: 47, america: 38 },
    { year: '2014', europe: 40, china: 46, america: 31 },
    { year: '2015', europe: 78, china: 50, america: 19 },
    { year: '2016', europe: 13, china: 90, america: 52 },
    { year: '2017', europe: 78, china: 132, america: 50 },
    { year: '2018', europe: 40, china: 134, america: 34 },
    { year: '2018', europe: 40, china: 134, america: 34 },
    { year: '2019', europe: 80, china: 96, america: 38 }
  ]
}

