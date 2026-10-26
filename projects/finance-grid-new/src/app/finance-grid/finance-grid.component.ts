import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewEncapsulation, computed, effect, inject, signal, viewChild } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IgxAvatarComponent } from 'igniteui-angular/avatar';
import { IgxChipComponent, IgxChipTypeVariant } from 'igniteui-angular/chips';
import { IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxLinearProgressBarComponent, IgxProgressType } from 'igniteui-angular/progressbar';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxCellTemplateDirective, IgxColumnComponent, IgxGridToolbarActionsComponent, IgxGridToolbarComponent, IgxGridToolbarExporterComponent, IgxGridToolbarHidingComponent, IgxGridToolbarPinningComponent, IgxGridToolbarTitleComponent } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxSparklineComponent } from 'igniteui-angular-charts';
import { IgxCsvExporterService, IgxExcelExporterService, IgxPdfExporterService, type IColumnExportingEventArgs } from 'igniteui-angular/grids/core';
import { FinanceDataService } from '../services/finance-data.service';
import { HighlightedTextComponent } from './highlighted-text.component';
import { LivePortfolioService, type LivePortfolioRow } from './live-portfolio.service';

/** Year length the elapsed figure is expressed in. */
const DAYS_PER_YEAR = 365;

/**
 * The line the tax code draws through a portfolio.
 *
 * A position held longer than a year is taxed as a long-term gain rather than at
 * the income rate, which makes this the most consequential thing about a holding
 * after its P&L - and the one thing none of the other columns can say. A $3,074
 * gain two days old and the same gain two years old are not worth the same
 * money, and without this column the grid would show them as identical.
 *
 * A day past the year, not the year itself: the rule is "held *more* than one
 * year", so a position at exactly 365 days is still short-term and the day after
 * is the one that counts. Two of the seeded rows sit on 365 precisely, which
 * makes them the column's most interesting cells rather than a rounding
 * question - they read "1 day to long-term treatment".
 */
const LONG_TERM_DAYS = DAYS_PER_YEAR + 1;

/** How one row's holding period reads: a tag, a figure, and progress to the line. */
interface HoldingTerm {
  label: string;
  variant: IgxChipTypeVariant;

  /** Elapsed period in the shortest honest form - `1y 287d`, or `94d`. */
  elapsed: string;

  /** Progress toward `LONG_TERM_DAYS` as a 0-100 value for the progress bar. */
  progressValue: number;

  /** The bar's colour keyword - the same two states the tag above it carries. */
  barType: IgxProgressType;

  /** What the tag and the bar convey, for anything that cannot see either. */
  hint: string;
}

/** Sparkline brushes per appearance. The chart paints to a canvas and cannot read a `var()`. */
const SPARKLINE_BRUSHES = {
  light: { up: '#1a9b62', down: '#d33a75' },
  dark: { up: '#34d399', down: '#ff7aae' }
} as const;

@Component({
  selector: 'app-finance-grid-new-sample',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IgxAvatarComponent,
    IgxChipComponent,
    IgxIconComponent,
    IgxIconButtonDirective,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxLinearProgressBarComponent,
    IgxSparklineComponent,
    IgxGridComponent,
    IgxColumnComponent,
    IgxCellTemplateDirective,
    IgxGridToolbarComponent,
    IgxGridToolbarTitleComponent,
    IgxGridToolbarActionsComponent,
    IgxGridToolbarHidingComponent,
    IgxGridToolbarPinningComponent,
    IgxGridToolbarExporterComponent,
    HighlightedTextComponent
  ],
  templateUrl: './finance-grid.component.html',
  styleUrl: './finance-grid.component.scss',
})
export class FinanceGridComponent implements OnInit, OnDestroy {
  protected readonly vm = this;

  private readonly financeData = inject(FinanceDataService);
  private readonly live = inject(LivePortfolioService);
  private readonly excelExporter = inject(IgxExcelExporterService);
  private readonly csvExporter = inject(IgxCsvExporterService);
  private readonly pdfExporter = inject(IgxPdfExporterService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  private readonly percentFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  private readonly financeNonExportableFields = new Set(['priceTrend']);
  private readonly viewportWidth = signal(isPlatformBrowser(this.platformId) ? window.innerWidth : 1280);
  private readonly resizeHandler = (): void => this.viewportWidth.set(window.innerWidth);

  /**
   * True while the page is prerendered on the server. `igx-grid` reports "Grid
   * has no data." whenever it is not in a browser, so the prerendered grid
   * shows its loading indicator instead, until the browser renders the rows.
   */
  protected readonly prerendering = isPlatformServer(this.platformId);

  private readonly grid = viewChild<IgxGridComponent>('financeGrid');

  protected readonly hideMostColumns = computed(() => this.viewportWidth() < 700);
  protected readonly financeRows = this.live.rows;
  protected readonly maxAllocationPct = this.financeData.maxAllocationPct;

  /**
   * The feed's state. The server has no timers and never starts the feed, but
   * the browser starts it before its first render, so the prerendered page
   * shows the state it hydrates into rather than a pause that never happens.
   */
  protected readonly isLive = computed(() => this.live.isLive() || this.prerendering);

  protected readonly isDark = signal(false);
  protected readonly financeAssetFilter = signal('');
  protected readonly filteredFinanceRows = computed(() => {
    const query = this.financeAssetFilter().trim().toLowerCase();
    if (!query) {
      return this.financeRows;
    }

    return this.financeRows.filter((row) => row.ticker.toLowerCase().includes(query) || row.company.toLowerCase().includes(query));
  });

  constructor() {
    this.configureExportExclusions();

    // Rows are marked to market in place, so the grid never sees a new `[data]`
    // array to react to - `markForCheck()` is its own answer to that. The
    // appearance is in here too: the sparkline brushes are plain inputs, and
    // an OnPush grid has no reason to re-read them when only a signal the
    // *parent* owns has changed.
    effect(() => {
      this.live.tick();
      this.isDark();
      this.grid()?.markForCheck();
    });
  }

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.adoptPrerenderedFilter();
      window.addEventListener('resize', this.resizeHandler);
      this.live.start();
    }
  }

  public ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
      this.live.stop();
    }
  }

  /**
   * The prerendered page shows the filter field before the app has started, so
   * anything typed there in that moment is the query. Hydration reuses that
   * input, and the first check would bind `[value]` back to an empty filter;
   * reading the field first keeps the text and applies it.
   */
  private adoptPrerenderedFilter(): void {
    const input = this.host.nativeElement.querySelector<HTMLInputElement>('#finance-asset-filter');
    if (input?.value) {
      this.financeAssetFilter.set(input.value);
    }
  }

  protected toggleTheme(): void {
    this.isDark.update((dark) => !dark);
  }

  protected toggleLive(): void {
    this.live.toggle();
  }

  protected onFinanceAssetSearch(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.financeAssetFilter.set(target.value);
  }

  protected financeAvatarInitials(ticker: string): string {
    const normalized = ticker.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return normalized.slice(0, 3) || 'EQ';
  }

  protected formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  protected formatPercent(value: number): string {
    return `${this.percentFormatter.format(Math.abs(value))}%`;
  }

  /**
   * The chip variant for a signed figure.
   *
   * Positive is `success`, negative is `igx-chip`'s `danger`, and a figure of
   * exactly zero is the neutral `info`.
   */
  protected chipVariant(value: number): IgxChipTypeVariant {
    if (value > 0) return 'success';
    if (value < 0) return 'danger';
    return 'info';
  }

  protected badgeLabel(value: number): string {
    const arrow = value > 0 ? '\u2191 ' : value < 0 ? '\u2193 ' : '';
    return `${arrow}${this.formatPercent(value)}`;
  }

  /**
   * One row's holding period, resolved in a single call.
   *
   * Returned whole rather than as four separate helpers so the template reads
   * it once through `@let` - the cell needs the tag, the figure, the bar and the
   * spoken description, and they all follow from the same day count.
   */
  protected holdingTerm(days: number): HoldingTerm {
    const held = Math.max(0, Math.trunc(days));
    const isLongTerm = held >= LONG_TERM_DAYS;
    const years = Math.floor(held / DAYS_PER_YEAR);
    const remainder = held % DAYS_PER_YEAR;
    const remaining = LONG_TERM_DAYS - held;

    // A sub-1% fill on a rounded 10px track renders as a dot rather than a bar,
    // which reads as a glitch - 17 days would look like a stray pixel. Short
    // holdings get a visible floor instead, the same 6% `allocationBarValue` uses
    // for the same reason. Zero stays zero: a position opened today has not
    // started counting, and a bar that says it has is worse than an empty one.
    const scaled = held > 0 ? Math.min(100, Math.max(6, (held / LONG_TERM_DAYS) * 100)) : 0;

    return {
      label: isLongTerm ? 'LONG TERM' : 'SHORT TERM',

      // Not `danger` for the short-term case: holding a position under a year
      // is an ordinary state, not a fault. `info` reads as "noted", which is
      // all this is until the position crosses over.
      variant: isLongTerm ? 'success' : 'info',

      // `1y` rather than `1y 0d` on the anniversary - a trailing zero reads as
      // a measurement that stopped short.
      elapsed: years > 0 ? (remainder > 0 ? `${years}y ${remainder}d` : `${years}y`) : `${held}d`,

      progressValue: scaled,
      barType: isLongTerm ? 'success' : 'info',
      hint: isLongTerm
        ? 'Long term \u2014 gains taxed at the long-term rate'
        : `Short term \u2014 ${remaining} ${remaining === 1 ? 'day' : 'days'} to long-term treatment`,
    };
  }

  /**
   * Allocation as a 0-100 bar value, scaled against the largest holding rather
   * than against 100 - the biggest position fills the track and the rest read
   * relative to it, which is the only way a 0.21% holding is visible at all.
   *
   * Floored at 6: below that the fill is narrower than its own corner radius
   * and renders as a dot.
   */
  protected allocationBarValue(value: number): number {
    const magnitude = Math.abs(value);
    if (magnitude === 0 || this.maxAllocationPct <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(6, (magnitude / this.maxAllocationPct) * 100));
  }

  protected isTickUp(row: LivePortfolioRow): boolean {
    return row.direction === 'up';
  }

  protected isTickDown(row: LivePortfolioRow): boolean {
    return row.direction === 'down';
  }

  /** The line's colour: the direction the holding is going. */
  protected sparklineBrush(changePct: number): string {
    const brushes = this.isDark() ? SPARKLINE_BRUSHES.dark : SPARKLINE_BRUSHES.light;
    return changePct < 0 ? brushes.down : brushes.up;
  }

  /** The colour of the stretch below zero, whichever way the session ends. */
  protected sparklineNegativeBrush(): string {
    return this.isDark() ? SPARKLINE_BRUSHES.dark.down : SPARKLINE_BRUSHES.light.down;
  }

  /**
   * Keeps the sparkline column out of every export.
   *
   * The exporters are root-provided, so these subscriptions outlive the
   * component: `takeUntilDestroyed` is what stops a second visit to the sample
   * from stacking another handler on each of them.
   */
  private configureExportExclusions(): void {
    const skipChartColumns = (args: IColumnExportingEventArgs): void => {
      if (this.financeNonExportableFields.has(args.field)) {
        args.cancel = true;
      }
    };

    this.excelExporter.columnExporting.pipe(takeUntilDestroyed()).subscribe(skipChartColumns);
    this.csvExporter.columnExporting.pipe(takeUntilDestroyed()).subscribe(skipChartColumns);
    this.pdfExporter.columnExporting.pipe(takeUntilDestroyed()).subscribe(skipChartColumns);
  }
}
