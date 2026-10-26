import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FinanceGridComponent } from './finance-grid/finance-grid.component';

@Component({
  selector: 'app-finance-grid-new',
  imports: [FinanceGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
