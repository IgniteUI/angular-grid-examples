import { Component } from '@angular/core';
import { AppComponent } from 'projects/grids/finance-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'finance-view',
  imports: [AppComponent],
  templateUrl: './finance-view.component.html',
  styleUrl: './finance-view.component.scss'
})
export class FinanceViewComponent {
}
