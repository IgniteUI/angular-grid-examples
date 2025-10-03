import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnChartDemoComponent } from './column-chart-sample/column-chart-sample.component';

@Component({
  selector: 'app-column-chart',
  standalone: true,
  imports: [CommonModule, ColumnChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
