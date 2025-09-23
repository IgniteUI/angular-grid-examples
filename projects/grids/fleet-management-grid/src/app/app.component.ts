import { Component, ViewEncapsulation } from '@angular/core';
import { FleetManagementGridComponent } from "./fleet-management-grid/fleet-management-grid.component";

@Component({
  selector: 'app-fleet-management',
  imports: [ FleetManagementGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'master-detail-grid';
}
