import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxAvatarModule } from 'igniteui-angular/avatar';
import { IgxBadgeModule } from 'igniteui-angular/badge';
import { IgxCardModule } from 'igniteui-angular/card';
import { IgxGridModule } from 'igniteui-angular/grids/grid';
import { IgxListModule } from 'igniteui-angular/list';
import { DataChartStylingDefaults, IgxCategoryChartModule, IgxDoughnutChartModule, IgxRingSeriesModule } from 'igniteui-angular-charts';

type SalesTheme = 'light' | 'dark';

/**
 * Chart colours, one set per appearance.
 *
 * The charts paint to canvas, so unlike everything else in the sample they
 * cannot read the palette through a CSS variable - every value below is a
 * literal copy of a palette shade and has to change alongside
 * `_sales-palette.scss`:
 *
 * | | light | dark |
 * | --- | --- | --- |
 * | `series` | primary, warn, secondary, success -500 | same |
 * | `label`, `sliceLabel` | gray-700 | gray-500 |
 * | `gridline` | gray-300 | gray-100 |
 * | `chip` | transparent | transparent |
 * | `bubble`, `bubbleText` | primary-500 + white | primary-500 + near-black |
 *
 * `series` is in the donut's slice order, which is also the legend's.
 *
 * `appearance` names the set; the template keys each chart on it, so a toggle
 * swaps the chart for a new one built with the other set.
 *
 * The tooltip and the axis bubbles are two different elements and take two
 * different fills, which is worth stating because they look like one thing:
 *
 * - `chip` is the canvas rectangle the item tooltip paints *under* the DOM box -
 *   and it is the callout, leg and all. Transparent, so it draws nothing and the
 *   DOM box is the whole tooltip: that is what lets all three look identical,
 *   since the donut's tooltip has no canvas half to disagree with.
 * - `bubble` is the value chip the crosshairs park on the axis. It takes the
 *   accent rather than the tooltip's fill, for the reason a neutral chip was
 *   tried and dropped: it has no border input, so a fill a step off the panel is
 *   barely visible (1.05:1 on the light theme). The accent is 4.9:1 / 5.7:1
 *   against the panel and it is the colour of the series the bubble annotates.
 *
 *   The ink flips with it, because the accent does not: primary-500 is the same
 *   value in both palettes, light enough on the dark set that white falls to
 *   2.7:1 and deep enough on the light set that near-black falls to 3.3:1. White
 *   over the light accent is 4.9:1; near-black over the dark one is 6.0:1.
 */
interface SalesChartPalette {
  appearance: SalesTheme;
  series: string[];
  trend: string[];
  deals: string[];
  label: string;
  gridline: string;
  sliceLabel: string;
  chip: string;
  bubble: string;
  bubbleText: string;
}

const SALES_CHART_THEMES: Record<SalesTheme, SalesChartPalette> = {
  light: {
    appearance: 'light',
    series: ['#7f4cf6', '#b8690c', '#d84b98', '#17835f'],
    trend: ['#7f4cf6', '#17835f'],
    deals: ['#7f4cf6'],
    label: '#445d7e',
    gridline: '#d7dfe9',
    sliceLabel: '#445d7e',
    chip: 'transparent',
    bubble: '#7f4cf6',
    bubbleText: '#ffffff'
  },
  dark: {
    appearance: 'dark',
    series: ['#a78bfa', '#e0a33c', '#f07cb8', '#35c48c'],
    trend: ['#a78bfa', '#35c48c'],
    deals: ['#a78bfa'],
    label: '#a3bad6',
    gridline: '#29405c',
    sliceLabel: '#a3bad6',
    chip: 'transparent',
    bubble: '#a78bfa',
    bubbleText: '#17202b'
  }
};

/**
 * The chart engine's lookup key for the rectangle it paints behind a tooltip.
 * A CSS class name in shape only - nothing in the document carries it.
 */
const SALES_POINTER_TOOLTIP_KEY = 'ui-chart-pointer-tooltip';

/** Live dashboards, so the table entry below outlives exactly this sample. */
let openSalesDashboards = 0;

/**
 * Themes the rectangle the engine paints behind every chart tooltip.
 *
 * There is no input for it: the fill comes from a CSS-shaped lookup the engine
 * makes through its renderer, and `DataChartStylingDefaults` is the table it
 * reads. It reads that table once, while the chart is being constructed, which
 * is why the template stamps each chart through `chartTheme()` rather than
 * binding to it - the entry has to be in place before the chart exists.
 *
 * The DOM tooltip that `.ig-tooltip-container-background` themes floats on top
 * of this rectangle at the same size, so the two have to agree; the border is
 * dropped here and left to the box above.
 */
function applySalesTooltipTheme(palette: SalesChartPalette): void {
  (DataChartStylingDefaults as Record<string, unknown>)[SALES_POINTER_TOOLTIP_KEY] = {
    'background-color': palette.chip,
    'border-top-color': palette.chip,
    'border-top-width': '0'
  };
}

interface MetricCard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
  iconClass: string;
}

interface ActivityRow {
  company: string;
  region: string;
  stage: string;
  value: string;
  rep: string;
  source: string;
  when: string;
}

interface LeaderboardItem {
  rank: number;
  name: string;
  quota: string;
  amount: string;
  delta: string;
  positive: boolean;
}

@Component({
  selector: 'app-sales-dashboard-sample',
  imports: [
    IgxBadgeModule,
    IgxIconComponent,
    IgxIconButtonDirective,
    IgxCardModule,
    IgxAvatarModule,
    IgxGridModule,
    IgxListModule,
    IgxCategoryChartModule,
    IgxDoughnutChartModule,
    IgxRingSeriesModule
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss',
  host: {
    '[class.dark-theme]': 'isDark()'
  }
})
export class SalesDashboardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * False while the page is prerendered. The template builds the charts only
   * in the browser, and shows the grid's loading indicator otherwise.
   */
  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly vm = this;

  constructor() {
    // The tooltip DOM is moved to `<body>`, out of reach of the host's palette
    // and of its `.dark-theme` class, so the appearance is mirrored there for
    // `sd-chart-tooltips()` to key off. Taken down again on destroy, since the
    // class outlives the component otherwise. Browser only: the prerendered
    // page always starts light.
    effect(() => {
      const dark = this.isDark();
      if (this.isBrowser) {
        this.document.body.classList.toggle('sd-dark', dark);
      }
    });

    // `DataChartStylingDefaults` is the charts package's own table, shared by
    // every chart on the page, so the sample takes its tooltip entry down again
    // on the way out and leaves the package default for whatever opens next.
    openSalesDashboards++;
    this.destroyRef.onDestroy(() => {
      if (this.isBrowser) {
        this.document.body.classList.remove('sd-dark');
      }
      if (--openSalesDashboards === 0) {
        delete (DataChartStylingDefaults as Record<string, unknown>)[SALES_POINTER_TOOLTIP_KEY];
      }
    });
  }

  protected readonly metrics: MetricCard[] = [
    { label: 'Revenue MTD', value: '$842.3K', delta: '12.4% vs target', positive: true, icon: 'attach_money', iconClass: 'rank-badge rank-1' },
    { label: 'Quota Attainment', value: '94%', delta: '1.3 pts vs last month', positive: true, icon: 'percent', iconClass: 'rank-badge rank-2' },
    { label: 'Deals Closed (Mtd)', value: '37', delta: '6 vs last month', positive: true, icon: 'tag', iconClass: 'rank-badge rank-3' },
    { label: 'Avg Deal Size', value: '$22.8K', delta: '1.9% vs last month', positive: false, icon: 'diamond', iconClass: 'icon-avg' }
  ];

  protected readonly revenueTrend = [
    { month: 'Jan', revenue: 648, targetLine: 635 },
    { month: 'Feb', revenue: 662, targetLine: 646 },
    { month: 'Mar', revenue: 684, targetLine: 658 },
    { month: 'Apr', revenue: 702, targetLine: 672 },
    { month: 'May', revenue: 728, targetLine: 696 },
    { month: 'Jun', revenue: 760, targetLine: 724 },
    { month: 'Jul', revenue: 790, targetLine: 752 }
  ];

  protected readonly revenueByRegion = [
    { region: 'West', value: 37 },
    { region: 'East', value: 32 },
    { region: 'Central', value: 22 },
    { region: 'International', value: 9 }
  ];

  protected readonly weeklyDeals = [
    { day: 'Mon', deals: 18 },
    { day: 'Tue', deals: 23 },
    { day: 'Wed', deals: 16 },
    { day: 'Thu', deals: 29 },
    { day: 'Fri', deals: 35 },
    { day: 'Sat', deals: 42 },
    { day: 'Sun', deals: 25 }
  ];

  protected readonly isDark = signal(false);

  /**
   * The charts' whole palette, read off the frozen map rather than rebuilt per
   * change-detection pass - the charts compare `[brushes]`-style inputs by
   * identity.
   *
   * The template stamps each chart through this rather than binding the colours
   * one by one, so that flipping the appearance rebuilds the chart. That is what
   * `applySalesTooltipTheme` needs: the engine reads the tooltip styling table
   * once, at construction, so the entry has to be in place first - writing it
   * from here rather than from an effect is what guarantees the order.
   */
  protected readonly chartTheme = computed(() => {
    const palette = SALES_CHART_THEMES[this.isDark() ? 'dark' : 'light'];
    applySalesTooltipTheme(palette);
    return palette;
  });

  protected readonly leaderboard: LeaderboardItem[] = [
    { rank: 1, name: 'Dana Voss', quota: '128% of quota', amount: '$312,400', delta: '18%', positive: true },
    { rank: 2, name: 'Marcus Ibe', quota: '116% of quota', amount: '$284,900', delta: '8%', positive: true },
    { rank: 3, name: 'Priya Shah', quota: '104% of quota', amount: '$256,100', delta: '14%', positive: true },
    { rank: 4, name: 'Tom Reyes', quota: '98% of quota', amount: '$231,700', delta: '-2%', positive: false },
    { rank: 5, name: 'Elena Cruz', quota: '91% of quota', amount: '$198,300', delta: '-5%', positive: false }
  ];

  protected readonly activityRows: ActivityRow[] = [
    { company: 'Vantage Corp', region: 'West', stage: 'Closed Won', value: '$48,200', rep: 'Dana Voss', source: 'Referral', when: '2h ago' },
    { company: 'Northfield Retail', region: 'Central', stage: 'Proposal Sent', value: '$22,000', rep: 'Priya Shah', source: 'Inbound', when: '5h ago' },
    { company: 'Callisto Systems', region: 'East', stage: 'Negotiation', value: '$67,500', rep: 'Marcus Ibe', source: 'Outbound', when: '1d ago' },
    { company: 'Bright Path LLC', region: 'West', stage: 'Closed Won', value: '$15,300', rep: 'Tom Reyes', source: 'Partner', when: '1d ago' },
    { company: 'Ferro Industrial', region: 'International', stage: 'Qualified', value: '$91,000', rep: 'Elena Cruz', source: 'Conference', when: '2d ago' }
  ];

  /**
   * The palette follows the host class for everything but the charts, and the
   * charts follow `chartTheme()` - so there is nothing to re-read here.
   */
  protected toggleTheme(): void {
    this.isDark.update((dark) => !dark);
  }

  protected stageClassFor(stage: string): string {
    if (stage === 'Closed Won') return 'stage-win';
    if (stage === 'Proposal Sent') return 'stage-proposal';
    if (stage === 'Negotiation') return 'stage-negotiation';
    if (stage === 'Qualified') return 'stage-qualified';
    return '';
  }
}
