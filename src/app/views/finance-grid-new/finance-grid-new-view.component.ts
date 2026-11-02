import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/finance-grid-new/src/app/app.component';

@Component({
  standalone: true,
  selector: 'finance-grid-new-view',
  imports: [AppComponent],
  templateUrl: './finance-grid-new-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './finance-grid-new-view.component.scss'
})
export class FinanceGridNewViewComponent {
}
