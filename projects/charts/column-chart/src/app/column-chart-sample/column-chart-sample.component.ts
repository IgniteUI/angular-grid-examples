import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THEME_TOKEN, ThemeToken } from 'igniteui-angular';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';

@Component({
  selector: 'app-column-chart-sample',
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
    IgxCategoryChartModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './column-chart-sample.component.html',
  styleUrl: './column-chart-sample.component.scss'
})
export class ColumnChartDemoComponent {

  public chartData = [
    { month: 'January', temperature: 3 },
    { month: 'February', temperature: 4 },
    { month: 'March', temperature: 9 },
    { month: 'April', temperature: 15 },
    { month: 'May', temperature: 21 },
    { month: 'June', temperature: 26 },
    { month: 'July', temperature: 29 },
    { month: 'August', temperature: 28 },
    { month: 'September', temperature: 24 },
    { month: 'October', temperature: 18 },
    { month: 'November', temperature: 11 },
    { month: 'December', temperature: 5 }
  ];
}

