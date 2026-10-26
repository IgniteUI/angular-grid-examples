import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/grid-fintech-100k/src/app/app.component';

@Component({
  standalone: true,
  selector: 'grid-fintech-100k-view',
  imports: [AppComponent],
  templateUrl: './grid-fintech-100k-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './grid-fintech-100k-view.component.scss'
})
export class GridFintech100kViewComponent {
}
