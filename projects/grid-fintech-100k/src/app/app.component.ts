import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { GridFinjs100KComponent } from './grid-finjs-100k/grid-finjs-100k.component';

@Component({
  selector: 'app-grid-fintech-100k',
  imports: [GridFinjs100KComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
