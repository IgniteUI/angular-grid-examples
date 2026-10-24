import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IGX_BUTTON_GROUP_DIRECTIVES, IButtonGroupEventArgs } from 'igniteui-angular/button-group';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import {
  DataChartStylingDefaults,
  FinancialIndicatorType,
  IgxFinancialChartComponent,
  IgxFinancialChartModule,
  IgxFinancialIndicatorTypeCollection,
} from 'igniteui-angular-charts';
import { SEED_STOCKS } from '../data/market-seed';
import { MarketDataService } from '../services/market-data.service';
import { TradingService } from '../services/trading.service';
import { WorkspaceService } from '../services/workspace.service';
import { percentChange } from '../util/finance';
import { FINANCE_PIPES } from '../util/finance.pipes';
import { CandlePoint, buildHistory, nextCandle } from './price-history';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * The windows the chart offers, each with the bar it is drawn from.
 *
 * A window implies an interval: a minute of one-minute candles is one candle, so
 * the short ones step in seconds and the long ones in days or weeks. The bar
 * counts keep every window between 60 and 260 candles - enough shape to read,
 * few enough to redraw on a tick.
 *
 * Weekends come out of the daily windows only. The intraday ones are drawn as a
 * continuous tape rather than modelling session hours, and the five-year window
 * steps a whole week at a time, so every one of its bars falls on the same
 * weekday - skipping weekends there would either drop the series or keep none of
 * it, depending on the day you opened the desk.
 */
const RANGE_STEPS = {
  '1 min': { step: SECOND, bars: 60, skipWeekends: false },
  '1 hour': { step: MINUTE, bars: 60, skipWeekends: false },
  '1 week': { step: HOUR, bars: 168, skipWeekends: false },
  '1 month': { step: DAY, bars: 22, skipWeekends: true },
  '3 months': { step: DAY, bars: 63, skipWeekends: true },
  '1 year': { step: DAY, bars: 252, skipWeekends: true },
  '5 years': { step: WEEK, bars: 260, skipWeekends: false },
} as const;

type Range = keyof typeof RANGE_STEPS;
const RANGES = Object.keys(RANGE_STEPS) as Range[];

const CHART_TYPES = ['Candle', 'Line', 'Column', 'Bar'] as const;
type ChartType = (typeof CHART_TYPES)[number];

/**
 * Chart colours per theme.
 *
 * The financial chart paints to a canvas and takes plain colour strings, so it
 * cannot read the `--ig-*` tokens. These are literal copies of the palette in
 * `_signal-desk-theme.scss` - success and error for the series, gray-700 for
 * the axis labels, `$sd-hairline` for the gridlines, gray-100/300/900 for the
 * tooltip and gray-50 for the final-value badges - and have to be changed
 * alongside it.
 */
const CHART_THEMES = {
  dark: {
    up: '#34d399',
    down: '#ff4d6a',
    label: '#7a93b5',
    gridline: '#1e2d44',
    tooltipBackground: '#141e2e',
    tooltipBorder: '#273d58',
    tooltipText: '#e2e8f0',

    // The badges the engine paints in the series brush - the final-value one on
    // each axis and the crosshair's price bubble - so this has to contrast with
    // the brush rather than with the desk: near-black on the dark theme's bright
    // green, near-white on the light theme's deep one.
    annotationText: '#0a0d14',

    // The crosshair's *time* bubble, under the x axis, is the exception: the
    // engine does not brush that one, so it came out near-black on near-black in
    // the dark theme and near-white on near-black in the light one. Stating both
    // halves makes it a neutral desk chip - gray-300 carrying gray-900 - rather
    // than whatever the engine defaults to.
    axisChipBackground: '#273d58',
    axisChipText: '#e2e8f0',
  },
  light: {
    // Same hue angles as the two above - 158 and 350 - deepened for a white
    // ground, and holding mint's 1.8x luminance lead over coral so the candle
    // field separates by value here too. See `$sd-light-palette`.
    up: '#147b55',
    down: '#a60722',
    label: '#646a78',

    // `$sd-hairline`, not gray-200: a chart's worth of rules at full border
    // weight is the loudest thing on a white field, and the axis labels already
    // say where each band sits.
    gridline: '#eeeff2',

    tooltipBackground: '#f8f9fb',
    tooltipBorder: '#cad0d8',
    tooltipText: '#212936',
    annotationText: '#ffffff',
    axisChipBackground: '#cad0d8',
    axisChipText: '#212936',
  },
} as const;

type ChartPalette = (typeof CHART_THEMES)[keyof typeof CHART_THEMES];

/**
 * The chart engine's lookup key for the tooltip box. A CSS class name in shape
 * only - nothing in the document carries it.
 */
const POINTER_TOOLTIP_KEY = 'ui-chart-pointer-tooltip';

/** Live chart panes, so the table entry below outlives exactly this sample. */
let openPanes = 0;

/**
 * Themes the box that the `Data` tooltip draws.
 *
 * There is no input for it: the whole `dataToolTip*` surface styles text. The
 * box's fill, border and thickness come from a CSS-shaped lookup the engine
 * makes through its renderer, and the charts are constructed with
 * `useDefaultsSource` on - so that lookup never touches the document and
 * `DataChartStylingDefaults`, the table the chart is handed at construction, is
 * the only thing it can see. Writing the entry there is the whole fix.
 *
 * The entry covers every chart this pane builds - price, volume, indicator and
 * zoom slider all read the same table - so any tooltip the engine draws is
 * themed. The volume and RSI panes fall back to the package's DOM tooltip
 * instead, which the shell stylesheet themes.
 *
 * `border-top-*` is not a slip: the engine reads one edge and applies it to all
 * four. The corner radius is the one thing out of reach - the tooltip layer
 * passes 0 for it whatever the table says - so the box has square corners.
 */
function applyPointerTooltipTheme(palette: ChartPalette): void {
  (DataChartStylingDefaults as Record<string, unknown>)[POINTER_TOOLTIP_KEY] = {
    'background-color': palette.tooltipBackground,
    'border-top-color': palette.tooltipBorder,
    'border-top-width': '1px',
  };
}

@Component({
  selector: 'app-chart-panel',
  imports: [NgTemplateOutlet, IgxFinancialChartModule, IGX_BUTTON_GROUP_DIRECTIVES, IgxButtonDirective, IgxIconComponent, FINANCE_PIPES],
  templateUrl: './chart-panel.html',
  styleUrl: './chart-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPanelComponent {
  private readonly market = inject(MarketDataService);
  private readonly trading = inject(TradingService);
  private readonly workspace = inject(WorkspaceService);
  private readonly destroyRef = inject(DestroyRef);

  readonly symbol = input.required<string>();

  /**
   * Tooltip type, as a CSS font shorthand - the engine hands it to the canvas.
   *
   * The desk's own 11px type rather than the chart package's Titillium Web
   * default; `dataToolTip*TextStyle` is the only part of the tooltip's text the
   * palette inputs do not cover.
   */
  readonly tooltipFont = "11px 'DM Sans', sans-serif";
  readonly tooltipHeaderFont = "700 11px 'DM Sans', sans-serif";

  readonly ranges = RANGES;
  readonly chartTypes = CHART_TYPES;
  readonly selectedRange = signal<Range>('1 min');
  readonly chartType = signal<ChartType>('Line');
  readonly showVolume = signal(true);
  readonly showRsi = signal(false);

  /** Per-tick snapshots - the feed and the engine both write in place. */
  readonly quote = computed(() => {
    this.market.tick();
    return this.market.snapshotOf(this.symbol());
  });

  readonly position = computed(() => {
    this.trading.marks();
    const symbol = this.symbol();
    const held = this.trading.positions().find(entry => entry.symbol === symbol);
    return held ? { ...held } : undefined;
  });

  /**
   * The visible window - the chart's `[dataSource]`.
   *
   * Synthetic history, anchored on the instrument's opening close, so it is
   * deterministic per symbol and window and never regenerates on a price tick:
   * its identity changes only with the symbol or the range. Handing the chart a
   * new array once a second would make it re-bind and redraw the whole series,
   * which is what made it flicker; instead the last candle is updated through
   * `notifySetItem` (see {@link markLiveCandle}).
   *
   * Built per window rather than sliced out of one long series, because the
   * windows no longer share a bar: a minute of seconds cannot be cut from a
   * decade of days. The last candle is a fresh object either way, so
   * {@link markLiveCandle} still has somewhere of its own to write.
   */
  readonly chartData = computed<CandlePoint[]>(() =>
    buildHistory(this.symbol(), anchorPriceOf(this.symbol()), RANGE_STEPS[this.selectedRange()]),
  );

  readonly currentPrice = computed(() => {
    const data = this.chartData();
    return this.quote()?.lastPrice ?? (data.length > 0 ? data[data.length - 1].Close : 0);
  });

  /**
   * Change over the visible window, not just the trading day. Reads the live
   * price rather than the candle, which the chart mutates outside the graph.
   */
  readonly rangeChange = computed(() => {
    const data = this.chartData();
    if (data.length < 2) {
      return { value: 0, pct: 0 };
    }

    const first = data[0].Close;
    const last = this.currentPrice();
    return { value: last - first, pct: percentChange(last, first) };
  });

  readonly sessionStats = computed(() => {
    const quote = this.quote();
    const latest = this.chartData().at(-1);

    return {
      open: latest?.Open ?? null,
      high: quote?.dayHigh ?? latest?.High ?? null,
      low: quote?.dayLow ?? latest?.Low ?? null,
      volume: quote?.volume ?? latest?.Volume ?? null,
    };
  });

  /**
   * The chart's colours - and the hook that themes the tooltip box.
   *
   * `applyPointerTooltipTheme` runs here rather than from an effect because the
   * chart reads the styling table once, while it is being constructed. The
   * template branches on this computed to stamp the chart, so the entry is
   * always in place first.
   */
  readonly chartPalette = computed(() => {
    const palette = CHART_THEMES[this.workspace.isDark() ? 'dark' : 'light'];
    applyPointerTooltipTheme(palette);
    return palette;
  });
  /** What the template compares {@link chartPalette} with to pick its branch. */
  readonly darkChartPalette = CHART_THEMES.dark;
  readonly volumeType = computed(() => (this.showVolume() ? 'Column' : 'None'));

  /**
   * A typed collection, not a comma-separated string: `FinancialIndicatorType`
   * has no "none" member, and the chart's enum parser rejects an empty string.
   * An empty collection is how you say "no studies".
   */
  readonly indicatorTypes = computed(() => new IgxFinancialIndicatorTypeCollection(
    this.showRsi() ? [FinancialIndicatorType.RelativeStrengthIndex] : [],
  ));

  private readonly chart = viewChild<IgxFinancialChartComponent>('priceChart');

  constructor() {
    // The styling table is a module singleton shared by every chart in the app,
    // so the entry has to come back out with the last pane - otherwise another
    // sample's chart inherits this desk's tooltip.
    openPanes++;
    this.destroyRef.onDestroy(() => {
      if (--openPanes === 0) {
        delete (DataChartStylingDefaults as Record<string, unknown>)[POINTER_TOOLTIP_KEY];
      }
    });

    effect(() => {
      this.market.tick();
      // Also re-mark right after a symbol or range change rebuilds the window,
      // so the newest candle is never a tick behind the tape.
      this.chartData();
      untracked(() => {
        this.rollWindow();
        this.markLiveCandle();
      });
    });
  }

  /**
   * Advances the window as its bars come due: seals the live bar, appends a new
   * one and drops the oldest, so the window stays the length it claims to be.
   *
   * This is what makes the short windows live rather than a frozen snapshot with
   * one growing candle on the end. It matters most where the bar is short: on a
   * one-second bar a new one is due every tick, and within a minute of watching
   * an unrolled window the live candle has moved further than the whole series
   * behind it - which is exactly what "the chart looks static" was.
   *
   * The long windows get this for free and need nothing: a daily bar comes due
   * once a day, so the loop simply never fires.
   *
   * Bars are pushed and shifted in place and the chart is told item by item, for
   * the same reason {@link markLiveCandle} exists - a new array would re-bind
   * and redraw the series.
   */
  private rollWindow(): void {
    const chart = this.chart();
    const data = this.chartData();
    const spec = RANGE_STEPS[this.selectedRange()];

    if (!chart || data.length === 0) {
      return;
    }

    // A backgrounded tab can come back hours later. Rolling a whole window's
    // worth of bars one at a time would just rebuild it, so that is the cap.
    const newest = data[data.length - 1].Date.getTime();
    const due = Math.min(Math.floor((Date.now() - newest) / spec.step), spec.bars);
    if (due <= 0) {
      return;
    }

    const live = this.market.quoteOf(this.symbol())?.lastPrice;

    for (let index = 1; index <= due; index++) {
      const previous = data[data.length - 1];
      // Only the bar that is still open takes the live price. Any bars behind it
      // are ones nobody watched, so they close where they opened.
      const close = index === due && live !== undefined ? live : previous.Close;
      const candle = nextCandle(previous, spec, close, newest + index * spec.step);

      data.push(candle);
      chart.notifyInsertItem(data, data.length - 1, candle);

      const dropped = data[0];
      data.shift();
      chart.notifyRemoveItem(data, 0, dropped);
    }
  }

  /**
   * Rolls the live price into the last candle and tells the chart about that one
   * item. This is the chart's equivalent of the grid's `markForCheck()`: an
   * incremental update, not a re-bind.
   */
  private markLiveCandle(): void {
    const chart = this.chart();
    const data = this.chartData();
    const live = this.market.quoteOf(this.symbol())?.lastPrice;

    if (!chart || data.length === 0 || live === undefined) {
      return;
    }

    const index = data.length - 1;
    const previous = data[index];
    if (previous.Close === live) {
      return;
    }

    const updated: CandlePoint = {
      ...previous,
      Close: live,
      High: Math.max(previous.High, live),
      Low: Math.min(previous.Low, live),
    };

    data[index] = updated;
    chart.notifySetItem(data, index, previous, updated);
  }

  onRangeSelected(event: IButtonGroupEventArgs): void {
    const range = RANGES[event.index];
    if (range) {
      this.selectedRange.set(range);
    }
  }

  onChartTypeSelected(event: IButtonGroupEventArgs): void {
    const type = CHART_TYPES[event.index];
    if (type) {
      this.chartType.set(type);
    }
  }

  /** The studies group is multi-select, so both events route through here. */
  onStudyToggled(event: IButtonGroupEventArgs, selected: boolean): void {
    if (event.index === 0) {
      this.showVolume.set(selected);
    } else {
      this.showRsi.set(selected);
    }
  }
}

/** Opening close from the seed table - static, so the history stays stable. */
function anchorPriceOf(symbol: string): number {
  return SEED_STOCKS.find(stock => stock.symbol === symbol)?.previousClose ?? 200;
}
