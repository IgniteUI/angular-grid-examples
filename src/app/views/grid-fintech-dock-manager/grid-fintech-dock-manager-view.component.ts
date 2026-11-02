import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/grid-fintech-dock-manager/src/app/app.component';

@Component({
  standalone: true,
  selector: 'grid-fintech-dock-manager-view',
  imports: [AppComponent],
  templateUrl: './grid-fintech-dock-manager-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './grid-fintech-dock-manager-view.component.scss'
})
export class GridFintechDockManagerViewComponent {
}
