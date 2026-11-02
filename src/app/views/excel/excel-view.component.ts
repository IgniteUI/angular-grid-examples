import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/excel/src/app/app.component';

@Component({
  standalone: true,
  selector: 'excel-view',
  imports: [AppComponent],
  templateUrl: './excel-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './excel-view.component.scss'
})
export class ExcelViewComponent {
}
