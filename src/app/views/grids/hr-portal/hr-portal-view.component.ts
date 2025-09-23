import { Component } from '@angular/core';
import { AppComponent } from 'projects/grids/hr-portal/src/app/app.component';

@Component({
  standalone: true,
  selector: 'hr-portal-view',
  templateUrl: './hr-portal-view.component.html',
  styleUrl: './hr-portal-view.component.scss',
  imports: [AppComponent],
})
export class HrPortalViewComponent {
}
