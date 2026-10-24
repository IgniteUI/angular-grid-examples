import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IgcDockManagerLayout } from 'igniteui-dockmanager';
import { defineCustomElements } from 'igniteui-dockmanager/loader';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IGX_DIALOG_DIRECTIVES, IgxDialogComponent } from 'igniteui-angular/dialog';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IButtonGroupEventArgs, IGX_BUTTON_GROUP_DIRECTIVES } from 'igniteui-angular/button-group';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_NAVIGATION_DRAWER_DIRECTIVES } from 'igniteui-angular/navigation-drawer';
import { IgxSwitchComponent } from 'igniteui-angular/switch';
import { BlotterComponent } from '../blotter/blotter';
import { ChartPanelComponent } from '../chart-panel/chart-panel';
import { AlertsPanelComponent } from '../alerts-panel/alerts-panel';
import { NewsPanelComponent } from '../news-panel/news-panel';
import { OrderTicketComponent } from '../order-ticket/order-ticket';
import { PositionsGridComponent } from '../positions-grid/positions-grid';
import { FEED_SPEEDS, MarketDataService } from '../services/market-data.service';
import { NotificationsService } from '../services/notifications.service';
import { TradingService } from '../services/trading.service';
import { WorkspaceService } from '../services/workspace.service';
import { DockPaneId, chartContentId, isFixedPaneId } from '../util/dock-layout';
import { FINANCE_PIPES } from '../util/finance.pipes';
import { WatchlistComponent } from '../watchlist/watchlist';

/** Detail of the Dock Manager's `layoutChange` event, which the package does not export. */
interface LayoutChangeDetail {
  layout: IgcDockManagerLayout;
}

/** Detail of the Dock Manager's `paneClose` event. */
interface PaneCloseDetail {
  panes: { contentId?: string; hidden?: boolean }[];
}

/**
 * Signal Desk - the sample's application shell.
 *
 * The shell owns no trading state: it wires the Dock Manager to the workspace
 * service, mounts one component per pane, and renders the account and feed
 * status that the services publish.
 *
 * It exists only in the browser: the app root renders it there and nowhere
 * else, because everything on it depends on the browser (see `AppComponent`).
 * So it reads the viewport and registers the Dock Manager element without
 * guarding for a server render.
 */
@Component({
  selector: 'app-signal-desk',
  imports: [
    NgTemplateOutlet,
    IGX_NAVIGATION_DRAWER_DIRECTIVES,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IgxIconComponent,
    IgxIconButtonDirective,
    IgxButtonDirective,
    IGX_DIALOG_DIRECTIVES,
    IgxBadgeComponent,
    IgxAvatarComponent,
    IgxSwitchComponent,
    WatchlistComponent,
    ChartPanelComponent,
    OrderTicketComponent,
    PositionsGridComponent,
    BlotterComponent,
    NewsPanelComponent,
    AlertsPanelComponent,
    FINANCE_PIPES,
  ],
  templateUrl: './signal-desk.component.html',
  styleUrl: './signal-desk.component.scss',
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalDeskComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly market = inject(MarketDataService);
  private readonly trading = inject(TradingService);
  private readonly notifications = inject(NotificationsService);
  private readonly workspace = inject(WorkspaceService);

  readonly feedSpeeds = FEED_SPEEDS;
  readonly paneToggles = this.workspace.paneToggles;

  /**
   * How many copies of the figure ribbon the header ticker stamps.
   *
   * A CSS-only loop slides the track by one run and restarts, so it needs
   * enough copies that the ones still ahead of the frame cover the bar at that
   * moment - see the `.bar-ticker` comment. This is the same number as
   * `--ticker-runs` in the stylesheet and has to move with it.
   */
  readonly tickerRuns = [0, 1, 2, 3];
  readonly chartContentId = chartContentId;

  readonly layout = this.workspace.layout;
  readonly chartSymbols = this.workspace.chartSymbols;
  readonly visiblePanes = this.workspace.visiblePanes;
  readonly isDark = this.workspace.isDark;

  readonly indices = this.market.indices;
  readonly feedStatus = this.market.status;
  readonly feedFrequency = this.market.frequency;
  readonly isPaused = this.market.isPaused;

  /** Expanded state of the nav drawer; it stays pinned either way. */
  readonly navExpanded = signal(false);

  private readonly notificationsDialog = viewChild.required<IgxDialogComponent>('notificationsDialog');
  private readonly resetDialog = viewChild.required<IgxDialogComponent>('resetDialog');
  private readonly deskOverlay = viewChild.required<ElementRef<HTMLElement>>('deskOverlay');

  readonly account = this.trading.account;
  readonly workingOrderCount = computed(() => this.trading.workingOrders().length);
  readonly unreadAlerts = this.notifications.unreadCount;

  /** Maps the feed's state onto a badge colour. */
  readonly feedBadgeType = computed<'success' | 'info' | 'warning' | 'primary'>(() => {
    switch (this.feedStatus()) {
      case 'live':
        return 'success';
      case 'simulated':
        return 'info';
      case 'connecting':
        return 'warning';
      default:
        return 'primary';
    }
  });

  constructor() {
    // Registers `igc-dockmanager` before the template creates it. Defining an
    // element that is already registered is a no-op, so the desk can be mounted
    // again after it was left.
    defineCustomElements();
    this.market.start();
    this.notifications.start();
  }

  ngAfterViewInit(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.workspace.initialiseViewport(rect.width, rect.height);
  }

  ngOnDestroy(): void {
    this.market.stop();
    this.notifications.stop();
  }

  // -- Command bar -----------------------------------------------------------

  toggleNav(): void {
    this.navExpanded.update(open => !open);
  }

  toggleTheme(): void {
    this.workspace.toggleTheme();
  }

  togglePlayback(): void {
    this.market.togglePlayback();
  }

  onFeedSpeedSelected(event: IButtonGroupEventArgs): void {
    const speed = this.feedSpeeds[event.index];
    if (speed) {
      this.market.setFrequency(speed.value);
    }
  }

  /**
   * Alerts open in a dialog rather than a pane, and showing them is what marks
   * them read - the panel itself is instantiated once, so it cannot own that.
   */
  showAlerts(): void {
    this.notifications.markAllRead();
    // Partial settings are merged over the dialog's defaults, so this keeps its
    // modal behaviour and position strategy and only redirects the outlet.
    this.notificationsDialog().open({ outlet: this.deskOverlay() });
  }

  // -- Nav rail --------------------------------------------------------------

  isPaneVisible(id: DockPaneId): boolean {
    return this.visiblePanes().has(id);
  }

  togglePane(id: DockPaneId): void {
    this.workspace.togglePane(id);
  }

  // -- Dock Manager ----------------------------------------------------------

  /**
   * The pane header's X *removes* a pane from the layout, and a pane that is no
   * longer in the layout cannot be brought back by the rail - `withPaneVisibility`
   * has nothing to find, so the switch silently does nothing.
   *
   * So for the fixed panes the close is cancelled and turned into a hide, which
   * is exactly the state the rail already drives. Chart documents keep the
   * default behaviour: they are meant to be closed for good and reopened from
   * the watchlist or the search box.
   *
   * A close never mixes the two - a tab group holds either the fixed panes or
   * the chart documents, never both - so this either claims the whole event or
   * leaves it alone.
   */
  onPaneClose(event: Event): void {
    const panes = (event as CustomEvent<PaneCloseDetail>).detail?.panes ?? [];
    if (panes.length === 0 || !panes.every(pane => isFixedPaneId(pane.contentId))) {
      return;
    }

    event.preventDefault();
    for (const pane of panes) {
      pane.hidden = true;
    }
  }

  onLayoutChange(event: Event): void {
    const args = (event as CustomEvent<LayoutChangeDetail>).detail;
    if (args?.layout) {
      this.workspace.applyLayout(args.layout);
    }
  }

  /**
   * Reset discards the whole session - the book and the blotter included - so
   * the rail's button asks before {@link confirmReset} does anything.
   */
  resetDesk(): void {
    this.resetDialog().open({ outlet: this.deskOverlay() });
  }

  /**
   * Puts the whole sample back to how it opened - arrangement, book, tape and
   * alerts, not just the layout.
   *
   * Each service owns its own reset; the shell only composes them, the same way
   * it starts and stops the feed. Order matters: the book is restored before the
   * tape, so the mark-to-market pass that the reset tick triggers runs against
   * the opening positions rather than the ones being replaced.
   */
  confirmReset(): void {
    this.resetDialog().close();

    const rect = this.host.nativeElement.getBoundingClientRect();
    this.workspace.reset(rect.width, rect.height);
    this.trading.reset();
    this.market.reset();
    this.notifications.reset();
  }
}
