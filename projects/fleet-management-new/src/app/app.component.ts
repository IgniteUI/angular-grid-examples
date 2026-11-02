import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FleetManagementComponent } from './fleet-management/fleet-management.component';

@Component({
  selector: 'app-fleet-management-new',
  imports: [FleetManagementComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
