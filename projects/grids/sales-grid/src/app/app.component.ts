import { Component, ViewEncapsulation } from '@angular/core';
import { SalesGridComponent } from './sales-grid/sales-grid.component';

@Component({
  selector: 'app-sales',
  imports: [ SalesGridComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
}
