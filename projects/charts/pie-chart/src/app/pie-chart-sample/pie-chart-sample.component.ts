import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import { IgxCategoryChartModule, IgxItemLegendModule, IgxPieChartModule } from 'igniteui-angular-charts';

@Component({
  selector: 'app-pie-chart-sample',
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
    IgxItemLegendModule,
    IgxPieChartModule
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './pie-chart-sample.component.html',
  styleUrl: './pie-chart-sample.component.scss'
})
export class PieChartDemoComponent {

  public energyGlobalDemand = [
    { value: 37, category: 'Cooling', summary: 'Cooling 37%' },
    { value: 25, category: 'Residential', summary: 'Residential 25%' },
    { value: 12, category: 'Heating', summary: 'Heating 12%' },
    { value: 11, category: 'Lighting', summary: 'Lighting 11%' },
    { value: 15, category: 'Other', summary: 'Other 15%' }
  ];

  public secondChartData = [
    { MarketShare: 37, Company: "Cooling", Summary: "Cooling 37%" },
    { MarketShare: 25, Company: "Residential", Summary: "Residential 25%" },
    { MarketShare: 12, Company: "Heating", Summary: "Heating 12%" },
    { MarketShare: 8, Company: "Lighting", Summary: "Lighting 8%" },
    { MarketShare: 18, Company: "Other", Summary: "Other 18%" }
  ];

  public pieSliceClickEvent(e: any): void {
    e.args.isExploded = !e.args.isExploded;
  }
}

