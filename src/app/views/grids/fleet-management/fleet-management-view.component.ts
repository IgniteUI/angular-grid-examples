import { Component } from '@angular/core';
import { AppComponent } from 'projects/grids/fleet-management-grid/src/app/app.component';

@Component({
  standalone: true,
  selector: 'fleet-management-view',
  imports: [AppComponent],
  templateUrl: './fleet-management-view.component.html',
  styleUrl: './fleet-management-view.component.scss',
})
export class FleetManagementViewComponent {
}
