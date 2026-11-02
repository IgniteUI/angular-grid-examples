import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/erp-hgrid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'erp-hgrid-view',
  templateUrl: './erp-hgrid-view.component.html',
  styleUrl: './erp-hgrid-view.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppComponent],
})
export class ErpHGridViewComponent {}
