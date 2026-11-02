import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/fleet-management-new/src/app/app.component';

@Component({
  standalone: true,
  selector: 'fleet-management-new-view',
  imports: [AppComponent],
  templateUrl: './fleet-management-new-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './fleet-management-new-view.component.scss'
})
export class FleetManagementNewViewComponent {
}
