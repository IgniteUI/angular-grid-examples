import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { HrPortalComponent } from "./hr-portal/hr-portal.component";

@Component({
  selector: 'app-hr',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HrPortalComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
