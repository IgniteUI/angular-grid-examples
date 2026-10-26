import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '@projects/hr-portal/src/app/app.component';

@Component({
  standalone: true,
  selector: 'hr-portal-view',
  templateUrl: './hr-portal-view.component.html',
  styleUrl: './hr-portal-view.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppComponent],
})
export class HrPortalViewComponent {
}
