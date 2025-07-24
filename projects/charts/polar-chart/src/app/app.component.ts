import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarChartDemoComponent } from './polar-chart-sample/polar-chart-sample.component';

@Component({
  selector: 'app-polar-chart',
  standalone: true,
  imports: [CommonModule, PolarChartDemoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
