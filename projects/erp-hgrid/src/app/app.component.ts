import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { ErpHGridSampleComponent } from './erp-hgrid-sample/erp-hgrid-sample.component';

@Component({
  selector: 'app-erp',
  standalone: true,
  imports: [ErpHGridSampleComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
