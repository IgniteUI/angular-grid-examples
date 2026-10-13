import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/fleet-management-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'fleet-management-view',
  imports: [AppComponent],
  templateUrl: './fleet-management-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './fleet-management-view.component.scss',
})
export class FleetManagementViewComponent {
}
