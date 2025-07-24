import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartDemoComponent } from './pie-chart-sample/pie-chart-sample.component';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, PieChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
