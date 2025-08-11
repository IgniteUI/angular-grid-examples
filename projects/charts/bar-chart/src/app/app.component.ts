import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartDemoComponent } from './bar-chart-sample/bar-chart-sample.component';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BarChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
