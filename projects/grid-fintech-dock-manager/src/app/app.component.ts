import { ChangeDetectionStrategy, Component, PLATFORM_ID, ViewEncapsulation, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SignalDeskComponent } from './signal-desk/signal-desk.component';

/**
 * The app root: the desk's theme, and the desk.
 *
 * The desk is rendered in the browser only. Everything on it depends on the
 * browser - the saved layout, watchlist and theme, the viewport the default
 * arrangement is sized against, the feed timers and the Dock Manager element -
 * so the prerendered page carries the empty host, already painted in the
 * desk's surface colour, and the desk is built on the client.
 */
@Component({
  selector: 'app-grid-fintech-dock-manager',
  imports: [SignalDeskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
}
