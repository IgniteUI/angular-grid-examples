import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { NotificationsService } from '../services/notifications.service';
import { FINANCE_PIPES } from '../util/finance.pipes';

/**
 * Desk alerts - fills, rejections and unusual moves.
 *
 * The body of the command bar's notifications dialog rather than a docked pane:
 * alerts are glanced at when the bell says there is something new, not kept on
 * screen.
 *
 * Marking them read belongs to whoever opens the dialog. This component is
 * instantiated once, so doing it here would only ever mark once.
 */
@Component({
  selector: 'app-alerts-panel',
  imports: [IGX_LIST_DIRECTIVES, IgxButtonDirective, IgxIconComponent, FINANCE_PIPES],
  templateUrl: './alerts-panel.html',
  styleUrl: './alerts-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPanelComponent {
  private readonly notifications = inject(NotificationsService);

  readonly now = this.notifications.now;
  readonly alerts = this.notifications.notifications;

  clearAlerts(): void {
    this.notifications.clear();
  }
}
