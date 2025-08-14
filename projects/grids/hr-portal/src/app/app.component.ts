import { Component, ViewEncapsulation } from '@angular/core';
import { HrPortalComponent } from "./hr-portal/hr-portal.component";

@Component({
  selector: 'app-hr',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [HrPortalComponent],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent {
  title = 'Home - IgniteUI for Angular';
}
