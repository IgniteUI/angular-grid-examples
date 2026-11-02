import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { SalesGridComponent } from './sales-grid/sales-grid.component';

@Component({
  selector: 'app-sales',
  imports: [ SalesGridComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
}
