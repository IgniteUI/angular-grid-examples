import { Component } from '@angular/core';
import { AppComponent } from 'projects/grids/erp-hgrid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'erp-hgrid-view',
  templateUrl: './erp-hgrid-view.component.html',
  styleUrl: './erp-hgrid-view.component.scss',
  imports: [AppComponent],
})
export class ErpHGridViewComponent {}
