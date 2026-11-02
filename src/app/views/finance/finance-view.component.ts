import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/finance-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'finance-view',
  imports: [AppComponent],
  templateUrl: './finance-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './finance-view.component.scss'
})
export class FinanceViewComponent {
}
