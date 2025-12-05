import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { THEME_TOKEN, ThemeToken } from 'igniteui-angular/core';
import { IgxCategoryChartModule, IgxLegendModule } from 'igniteui-angular-charts';

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
    IgxCategoryChartModule,
    IgxLegendModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './line-chart-sample.component.html',
  styleUrl: './line-chart-sample.component.scss'
})
export class LineChartDemoComponent {

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

