import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, PLATFORM_ID, ViewEncapsulation, computed, effect, inject, signal, viewChild } from '@angular/core';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IGX_CARD_DIRECTIVES } from 'igniteui-angular/card';
import { IGX_CHIPS_DIRECTIVES } from 'igniteui-angular/chips';
import { IGX_BUTTON_GROUP_DIRECTIVES, IButtonGroupEventArgs } from 'igniteui-angular/button-group';
import { IGX_GRID_DIRECTIVES, IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxGridStateDirective } from 'igniteui-angular/grids/core';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IGX_DIALOG_DIRECTIVES, IgxDialogComponent } from 'igniteui-angular/dialog';
import { IgxSnackbarComponent } from 'igniteui-angular/snackbar';
import { IGX_ACTION_STRIP_DIRECTIVES } from 'igniteui-angular/action-strip';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { CategoryChartType, DataChartStylingDefaults, IgxCategoryChartModule, IgxDoughnutChartComponent, IgxRingSeriesComponent, LabelsPosition } from 'igniteui-angular-charts';
import { Visibility } from 'igniteui-angular-core';
import { FleetDataService, type FleetStatus, type FleetVehicle } from '../services/fleet-data.service';
import type { FleetPaintColor } from '../services/fleet-car-photos';
import { FleetLiveChartsDirective } from './fleet-live-charts.directive';

type FleetStatusFilter = 'all' | FleetStatus;

/**
 * How each status presents. The badge is a bare dot - `igx-badge`'s own `dot`
 * mode, so the size tracks `--ig-size` with the rest of the sample rather than
 * being pinned here - and the status word beside it carries the meaning. The
 * dot is `aria-hidden`, which is why dropping the icons costs nothing: the cell
 * already read as its text to a screen reader, and colour was never the only
 * channel.
 */
interface FleetStatusBadge {
  type: 'info' | 'success' | 'warning';
  /** Only the state that needs acting on draws attention to itself. */
  pulse: boolean;
}

const FLEET_STATUS_BADGES: Record<FleetStatus, FleetStatusBadge> = {
  Active: { type: 'info', pulse: false },
  Available: { type: 'success', pulse: false },
  'In Maintenance': { type: 'warning', pulse: true }
};

interface FleetTripRow {
  date: string;
  from: string;
  to: string;
  startMeter: string;
  endMeter: string;
  distance: string;
  duration: string;
  driver: string;
}

interface FleetMaintenanceRow {
  date: string;
  service: string;
  odometer: string;
  cost: string;
  status: 'Completed' | 'Scheduled';
}

interface FleetCostItem {
  label: string;
  value: number;
  tone: 'fuel' | 'maintenance' | 'insurance' | 'tolls';
}

interface FleetCostDistributionPoint {
  label: string;
  displayLabel: string;
  percentage: string;
  value: number;
  tone: FleetCostItem['tone'];
}

interface FleetMonthlySpendPoint { month: string; spend: number; }
interface FleetUtilizationComparisonPoint { month: string; priorYear: number; currentYear: number; }

interface FleetDetail {
  tripSummary: { trips: number; totalDistance: string; avgTrip: string };
  tripRows: FleetTripRow[];
  maintenanceNotice: string;
  maintenanceRows: FleetMaintenanceRow[];
  totalCost: string;
  topCostCategory: string;
  peakSpendMonth: string;
  costDistribution: FleetCostDistributionPoint[];
  monthlySpend: FleetMonthlySpendPoint[];
  utilization: { rate: string; activeHours: string; idleHours: string; trips: number };
  utilizationSeries: FleetUtilizationComparisonPoint[];
  utilizationYoY: string;
}

type FleetSize = 'small' | 'medium' | 'large';

const FLEET_DEFAULT_SIZE: FleetSize = 'medium';

type FleetTheme = 'dark' | 'light';

const FLEET_DEFAULT_THEME: FleetTheme = 'dark';

interface FleetChartPalette {
  /** Slice brushes, in the donut's own order: fuel, maintenance, insurance, tolls. */
  cost: string[];
  /**
   * Text the engine draws *on top of* a series brush - the percentage inside
   * every donut slice, and the value in the axis bubble under the cursor. One
   * colour serves all of them; see the note below.
   */
  onBrush: string;
  spend: string[];
  /** Column brushes, in the comparison chart's order: current year, prior year. */
  utilization: string[];
  label: string;
  gridline: string;
  tooltipBackground: string;
  tooltipBorder: string;
}

/**
 * Chart colours, one set per appearance.
 *
 * The charts paint to canvas, so unlike everything else in the sample they
 * cannot read the palette through a CSS variable and need their own values.
 * Every one below is a literal copy of a palette shade, so it has to change
 * alongside `_palette.scss`:
 *
 * | | dark | light |
 * | --- | --- | --- |
 * | `cost` | primary, warn, success, error -500 | same |
 * | `onBrush` | surface-500 | white |
 * | `spend` | primary-500 | same |
 * | `utilization` | primary-500, success-500 | same |
 * | `label` | gray-700 | gray-700 |
 * | `gridline` | gray-200 | gray-600 |
 * | `tooltipBackground` | surface-100 | surface-600 |
 * | `tooltipBorder` | gray-100 | surface-700 |
 *
 * Info is the one family the charts do not draw with, on purpose: it sits too
 * close to the accent to plot beside it. On the light palette the two are 3
 * degrees apart in hue (info 216, accent 219) and on the dark one 41, so a
 * slice of each would read as one colour at the light end and as a near-miss
 * at the dark. Info still carries the Active status, where it is a badge rather
 * than a plot and never shares an edge with the accent.
 *
 * Maintenance is orange and tolls red rather than the other way round: those
 * two are 15 degrees apart on the light palette, which is close enough that the
 * pair has to stay non-adjacent in the ring, and the data order puts insurance
 * between them.
 *
 * `onBrush` contrasts with a series brush rather than with the appearance, so
 * it does not flip with the theme for the usual reason - it flips because the
 * brushes do. One value covers every place the engine paints text on a brush,
 * because each appearance's brushes all sit on the same side of the line: the
 * dark palette's are mid-tone or brighter, so the surface's own near-black
 * clears AA on all of them (5.6:1 at worst, on tolls), and the light palette's
 * are deep, so white does (6.5:1 at worst, also tolls).
 *
 * Every piece of text on either chart clears AA. Light maintenance used to be
 * the exception, at 2.4:1 under white - closing it is what moved `$fleet-warn-
 * light` to a deep burnt orange, and the legend dot followed on its own,
 * because `.fleet-cost-tone-maintenance` is a `--ig-warn-500` reference.
 *
 * The two grays are chosen rather than derived. `label` is gray-700 in both:
 * the ramp inverts off the surface's luminance, and 700 is the shallowest tone
 * that clears AA on each - gray-600 reads fine over near-black but falls to
 * 4.1:1 on paper. `gridline` is not text, so it is held to 1.4.11's 3:1
 * instead, and it cannot take one shade for both: the tone that reads as a
 * hairline over near-black is a bright line on paper, so the two appearances
 * take different ends of the ramp (3.2:1 dark, 4.1:1 light). This is the same
 * split `$fleet-border` makes in Sass, where `light-dark()` can express it -
 * and the light half is 600 for the same reason it is there: 500 measures
 * 2.997:1, just under the bar.
 */
const FLEET_CHART_THEMES: Record<FleetTheme, FleetChartPalette> = {
  dark: {
    cost: ['#5099f9', '#ed8936', '#85ec97', '#ed546f'],
    onBrush: '#0a0e10',
    spend: ['#5099f9'],
    utilization: ['#5099f9', '#85ec97'],
    label: '#e9eef1',
    gridline: '#4b6477',
    tooltipBackground: '#12171a',
    tooltipBorder: '#334451'
  },
  light: {
    cost: ['#1145a8', '#9a3412', '#166534', '#b91c1c'],
    onBrush: '#ffffff',
    spend: ['#1145a8'],
    utilization: ['#1145a8', '#166534'],
    label: '#3f5083',
    gridline: '#6075b3',
    tooltipBackground: '#b8dbfe',
    tooltipBorder: '#91c7fe'
  }
};

/**
 * The chart engine's lookup key for the box it paints behind a tooltip. A CSS
 * class name in shape only - nothing in the document carries it.
 */
const FLEET_POINTER_TOOLTIP_KEY = 'ui-chart-pointer-tooltip';

/** Live fleet samples, so the table entry below outlives exactly this sample. */
let openFleetSamples = 0;

/**
 * Themes the rectangle the engine paints behind every chart tooltip.
 *
 * There is no input for it. The fill and border come from a CSS-shaped lookup
 * the engine makes through its renderer, and the category and doughnut charts
 * are both constructed with `useDefaultsSource` on - so that lookup never
 * touches the document and `DataChartStylingDefaults`, the table the chart is
 * handed at construction, is the only thing it can see.
 *
 * The DOM tooltip that `.ig-tooltip-container-background` themes floats on top
 * of this rectangle at the same size, so the two have to agree: the border is
 * dropped here and left to the box above, and only the fill is stated, to keep
 * a stray hairline of the wrong colour from showing at the edges.
 *
 * The engine reads the table once, while the chart is being constructed, which
 * is why the template stamps each chart through the palette rather than binding
 * to it - see `fleetChartTheme`.
 */
function applyFleetTooltipTheme(palette: FleetChartPalette): void {
  (DataChartStylingDefaults as Record<string, unknown>)[FLEET_POINTER_TOOLTIP_KEY] = {
    'background-color': palette.tooltipBackground,
    'border-top-color': palette.tooltipBackground,
    'border-top-width': '0'
  };
}

@Component({
  selector: 'app-fleet-management-new-sample',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IgxIconComponent,
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_ACTION_STRIP_DIRECTIVES,
    IgxSnackbarComponent,
    IGX_DIALOG_DIRECTIVES,
    IgxButtonDirective,
    IgxIconButtonDirective,
    IGX_CHIPS_DIRECTIVES,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IGX_GRID_DIRECTIVES,
    IgxGridStateDirective,
    IgxBadgeComponent,
    IGX_TABS_DIRECTIVES,
    IGX_CARD_DIRECTIVES,
    IgxDoughnutChartComponent,
    IgxRingSeriesComponent,
    IgxCategoryChartModule,
    FleetLiveChartsDirective
  ],
  templateUrl: './fleet-management.component.html',
  styleUrl: './fleet-management.component.scss',
  host: {
    '[class.light-theme]': '!isDark()',
    '[class.fleet-size-small]': "fleetSize() === 'small'",
    '[class.fleet-size-large]': "fleetSize() === 'large'"
  }
})
export class FleetManagementComponent implements OnInit, AfterViewInit {
  protected readonly vm = this;

  private readonly fleetData = inject(FleetDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * The grid renders rows only in a browser and reports no data anywhere else,
   * so the prerendered page shows the grid's loading state rather than its
   * empty message until the browser takes over.
   */
  protected readonly fleetPrerendering = isPlatformServer(this.platformId);

  protected readonly fleetTheme = signal<FleetTheme>(FLEET_DEFAULT_THEME);
  protected readonly isDark = computed(() => this.fleetTheme() === 'dark');

  /**
   * The charts' whole palette, read off the frozen map rather than rebuilt per
   * change-detection pass - the charts compare `[brushes]`-style inputs by
   * identity.
   *
   * The template stamps each chart through this rather than binding the colours
   * one by one, so that flipping the appearance rebuilds the chart. That is what
   * `applyFleetTooltipTheme` needs: the engine reads the tooltip styling table
   * once, at construction, so the entry has to be in place first - writing it
   * from here rather than from an effect is what guarantees the order.
   */
  protected readonly fleetChartTheme = computed(() => {
    const palette = FLEET_CHART_THEMES[this.fleetTheme()];
    applyFleetTooltipTheme(palette);
    return palette;
  });

  protected readonly fleetVehicles = this.fleetData.fleetVehicles;

  /** Vehicles whose every photo failed to load; they fall back to the placeholder. */
  private readonly fleetVehiclesWithoutPhoto = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly fleetSizes: readonly FleetSize[] = ['small', 'medium', 'large'];
  protected readonly fleetSize = signal<FleetSize>(FLEET_DEFAULT_SIZE);

  protected readonly fleetStatusFilter = signal<FleetStatusFilter>('all');
  protected readonly fleetSearchQuery = signal('');

  private appliedSize: FleetSize = FLEET_DEFAULT_SIZE;

  private readonly detailCache = new Map<string, FleetDetail>();

  private readonly fleetSnackbar = viewChild<IgxSnackbarComponent>('fleetSnackbar');
  private readonly fleetResetDialog = viewChild<IgxDialogComponent>('fleetResetDialog');
  private readonly fleetOverlay = viewChild<ElementRef<HTMLElement>>('fleetOverlay');
  private readonly fleetGrid = viewChild<IgxGridComponent>('fleetGrid');
  private readonly fleetGridState = viewChild(IgxGridStateDirective);

  /** The untouched grid layout, serialized so every restore parses its own copy. */
  private pristineGridState?: string;

  /** Everything the search matches, before the status chips narrow it further. */
  private readonly searchedFleetVehicles = computed(() => {
    const query = this.fleetSearchQuery().trim().toLowerCase();
    if (!query) return this.fleetVehicles();

    return this.fleetVehicles().filter((vehicle) => {
      const target = [vehicle.id, vehicle.licensePlate, vehicle.vin, vehicle.make, vehicle.model, vehicle.locationCity];
      return target.join(' ').toLowerCase().includes(query);
    });
  });

  protected readonly filteredFleetVehicles = computed(() => {
    const status = this.fleetStatusFilter();
    const vehicles = this.searchedFleetVehicles();
    return status === 'all' ? vehicles : vehicles.filter((vehicle) => vehicle.status === status);
  });

  // Counted off the search results so the chips and the rows always agree.
  protected readonly fleetMetrics = computed(() => {
    const vehicles = this.searchedFleetVehicles();
    const countOf = (status: FleetStatus): number => vehicles.filter((vehicle) => vehicle.status === status).length;
    return [
      { label: 'All vehicles', value: vehicles.length },
      { label: 'Active', value: countOf('Active') },
      { label: 'Available', value: countOf('Available') },
      { label: 'In Maintenance', value: countOf('In Maintenance') }
    ];
  });

  constructor() {
    // `DataChartStylingDefaults` is the charts package's own table, shared by
    // every chart on the page, so the sample takes the tooltip entry down again
    // on the way out and leaves the package's default in place for whatever
    // opens next.
    openFleetSamples++;
    this.destroyRef.onDestroy(() => {
      if (--openFleetSamples === 0) {
        delete (DataChartStylingDefaults as Record<string, unknown>)[FLEET_POINTER_TOOLTIP_KEY];
      }
    });

    // The query filters the rows; the grid's own search marks where each row
    // matched. Driven from an effect so it runs once the filtered rows are in.
    effect(() => {
      const query = this.fleetSearchQuery().trim();
      const grid = this.fleetGrid();
      if (!grid) return;

      grid.clearSearch();
      if (query) grid.findNext(query);
    });

    // Row height derives from --ig-size and virtualization caches it, so the
    // grid has to be told once a new density has been applied. The first run is
    // skipped: the grid measures itself on init and cannot reflow before that.
    effect(() => {
      const size = this.fleetSize();
      if (size === this.appliedSize) return;

      this.appliedSize = size;
      this.fleetGrid()?.reflow();
    });
  }

  ngOnInit(): void {
    // The catalog is fetched by relative URL from this app's own assets, so only
    // the browser asks for it; the prerendered page shows no detail rows anyway.
    if (isPlatformBrowser(this.platformId)) {
      void this.fleetData.loadVehicleImageCatalog();
    }
  }

  ngAfterViewInit(): void {
    // Sorting, pinning, hiding, column order, filters and expanded rows live on
    // the grid rather than in the data, so reset needs a snapshot of them taken
    // before the user can touch anything.
    const state = this.fleetGridState()?.getState(true);
    if (typeof state === 'string') this.pristineGridState = state;
  }

  /** Relative to today so the sample does not date itself. */
  protected readonly fleetUtilizationYears = ((current: number) => ({ current, prior: current - 1 }))(
    new Date().getFullYear()
  );

  /**
   * Everything an expanded row renders, built once per vehicle.
   *
   * The template reads several of these per change-detection pass, and the
   * charts compare `[dataSource]` by identity - rebuilding the arrays each call
   * would make them re-render continuously. Status is the only mutable input,
   * so keying on it lets an entry invalidate itself when a vehicle changes.
   */
  protected fleetDetail(vehicle: FleetVehicle): FleetDetail {
    const key = `${vehicle.id}:${vehicle.status}`;
    let detail = this.detailCache.get(key);

    if (!detail) {
      const costDistribution = this.fleetCostDistribution(vehicle);
      const monthlySpend = this.fleetMonthlyOperatingSpend(vehicle);

      detail = {
        tripSummary: this.fleetTripSummary(vehicle),
        tripRows: this.fleetTripHistory(vehicle),
        maintenanceNotice: this.fleetMaintenanceNotice(vehicle),
        maintenanceRows: this.fleetMaintenanceRows(vehicle),
        totalCost: this.fleetTotalCost(vehicle),
        topCostCategory: this.fleetTopCostCategory(costDistribution),
        peakSpendMonth: this.fleetPeakSpendMonth(monthlySpend),
        costDistribution,
        monthlySpend,
        utilization: this.fleetUtilizationSummary(vehicle),
        utilizationSeries: this.fleetUtilizationSeries(vehicle),
        utilizationYoY: this.fleetUtilizationYoY(vehicle)
      };
      this.detailCache.set(key, detail);
    }

    return detail;
  }

  protected updateSearchQuery(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.fleetSearchQuery.set(target.value);
    }
  }

  protected setVehicleStatus(vehicle: FleetVehicle, status: FleetStatus): void {
    if (vehicle.status === status) return;

    this.fleetData.setVehicleStatus(vehicle.id, status);
    this.notify(`${vehicle.id} \u2014 ${vehicle.make} ${vehicle.model} set to ${status}`);
  }

  protected onFleetSizeSelected(event: IButtonGroupEventArgs): void {
    const size = this.fleetSizes[event.index];
    if (size) {
      this.fleetSize.set(size);
    }
  }

  protected toggleTheme(): void {
    this.fleetTheme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  /**
   * Reset throws away everything the user has done to the sample, so it asks
   * first. {@link confirmResetFleet} is what actually resets.
   *
   * The dialog opens into the outlet inside the host rather than the default
   * body-level one: the palette is declared on the host, and the overlay moves
   * the dialog's content out of `igx-dialog`, so a body-level outlet would
   * render it outside every `--ig-*` token it needs - including the light one.
   */
  protected askResetFleet(): void {
    const outlet = this.fleetOverlay();
    if (outlet) {
      this.fleetResetDialog()?.open({ outlet });
    }
  }

  protected confirmResetFleet(): void {
    this.fleetResetDialog()?.close();
    this.resetFleet();
  }

  private resetFleet(): void {
    this.fleetTheme.set(FLEET_DEFAULT_THEME);
    this.fleetData.resetVehicles();
    this.fleetStatusFilter.set('all');
    this.fleetSearchQuery.set('');
    this.fleetSize.set(FLEET_DEFAULT_SIZE);
    this.resetGridLayout();
    this.notify('Fleet reset to its opening state');
  }

  /** Puts sorting, filters, column order, pinning, hiding and expanded rows back. */
  private resetGridLayout(): void {
    const grid = this.fleetGrid();
    const state = this.fleetGridState();
    if (!grid || !state || !this.pristineGridState) return;

    // Cell ranges are the one piece the state restores on top of rather than
    // replacing, so they are cleared first.
    grid.clearCellSelection();
    state.setState(this.pristineGridState);
    grid.clearSearch();
  }

  private notify(message: string): void {
    this.fleetSnackbar()?.open(message);
  }

  protected fleetStatusBadge(status: FleetStatus): FleetStatusBadge {
    return FLEET_STATUS_BADGES[status];
  }

  protected isFleetFilterActive(filter: FleetStatusFilter): boolean {
    return this.fleetStatusFilter() === filter;
  }

  protected setFleetFilter(filter: FleetStatusFilter): void {
    this.fleetStatusFilter.set(filter);
  }

  private fleetTripSummary(vehicle: FleetVehicle): { trips: number; totalDistance: string; avgTrip: string } {
    const seed = this.fleetSeed(vehicle);
    const trips = 18 + (seed % 8);
    const totalMiles = 248 + (seed % 9) * 16;
    return { trips, totalDistance: `${this.formatWholeNumber(totalMiles)} mi`, avgTrip: `${(totalMiles / trips).toFixed(1)} mi` };
  }

  private fleetTripHistory(vehicle: FleetVehicle): FleetTripRow[] {
    const seed = this.fleetSeed(vehicle);
    const city = this.fleetCity(vehicle);
    const baseDistance = 8.4 + (seed % 5) * 1.3;
    const currentMileage = this.fleetMileageValue(vehicle);
    const tripDistances = [baseDistance + 4.5, baseDistance + 0.1, baseDistance + 8.8, baseDistance + 8.1, baseDistance + 5.2, baseDistance + 6.6].map((v) => Number(v.toFixed(1)));

    let runningMeter = currentMileage + tripDistances.reduce((sum, value) => sum + value, 0);
    const buildMeters = (distance: number): { startMeter: string; endMeter: string } => {
      const endMeterValue = runningMeter;
      const startMeterValue = Math.max(0, endMeterValue - distance);
      runningMeter = startMeterValue;
      return { startMeter: `${this.formatOneDecimal(startMeterValue)} mi`, endMeter: `${this.formatOneDecimal(endMeterValue)} mi` };
    };

    return [
      { date: 'Jul 22', from: `Depot - ${city}`, to: `Client Site - ${city}`, ...buildMeters(tripDistances[0]), distance: `${tripDistances[0].toFixed(1)} mi`, duration: `${24 + (seed % 9)} min`, driver: this.fleetDriverName(vehicle, 0) },
      { date: 'Jul 21', from: `Client Site - ${city}`, to: `Depot - ${city}`, ...buildMeters(tripDistances[1]), distance: `${tripDistances[1].toFixed(1)} mi`, duration: `${19 + (seed % 6)} min`, driver: this.fleetDriverName(vehicle, 0) },
      { date: 'Jul 19', from: `Depot - ${city}`, to: `Warehouse - ${city}`, ...buildMeters(tripDistances[2]), distance: `${tripDistances[2].toFixed(1)} mi`, duration: `${32 + (seed % 10)} min`, driver: this.fleetDriverName(vehicle, 1) },
      { date: 'Jul 17', from: `Warehouse - ${city}`, to: `Depot - ${city}`, ...buildMeters(tripDistances[3]), distance: `${tripDistances[3].toFixed(1)} mi`, duration: `${30 + (seed % 9)} min`, driver: this.fleetDriverName(vehicle, 1) },
      { date: 'Jul 15', from: `Depot - ${city}`, to: `Regional Office - ${city}`, ...buildMeters(tripDistances[4]), distance: `${tripDistances[4].toFixed(1)} mi`, duration: `${26 + (seed % 8)} min`, driver: this.fleetDriverName(vehicle, 2) },
      { date: 'Jul 13', from: `Regional Office - ${city}`, to: `Service Hub - ${city}`, ...buildMeters(tripDistances[5]), distance: `${tripDistances[5].toFixed(1)} mi`, duration: `${28 + (seed % 7)} min`, driver: this.fleetDriverName(vehicle, 3) }
    ];
  }

  private fleetMaintenanceNotice(vehicle: FleetVehicle): string {
    const seed = this.fleetSeed(vehicle);
    const services = ['Tire rotation & balance', 'Brake fluid inspection', 'Air filter replacement', 'Multi-point inspection'];
    const service = services[seed % services.length];
    const dueMileage = this.nextServiceMileage(vehicle);
    return `Next service due: ${service} \u00b7 est. ${this.formatWholeNumber(dueMileage)} mi`;
  }

  private fleetMaintenanceRows(vehicle: FleetVehicle): FleetMaintenanceRow[] {
    const mileage = this.fleetMileageValue(vehicle);
    const dueMileage = this.nextServiceMileage(vehicle);
    return [
      { date: 'Jun 28, 2026', service: 'Oil & filter change', odometer: `${this.formatWholeNumber(Math.max(0, mileage - 2700))} mi`, cost: '$85', status: 'Completed' },
      { date: 'Mar 14, 2026', service: 'Brake pad replacement (front)', odometer: `${this.formatWholeNumber(Math.max(0, mileage - 6050))} mi`, cost: '$340', status: 'Completed' },
      { date: 'Dec 02, 2025', service: 'Annual inspection', odometer: `${this.formatWholeNumber(Math.max(0, mileage - 11500))} mi`, cost: '$120', status: 'Completed' },
      { date: 'Aug 30, 2026', service: this.fleetMaintenanceNotice(vehicle).split(': ')[1].split(' \u00b7 ')[0], odometer: `est. ${this.formatWholeNumber(dueMileage)} mi`, cost: '\u2014', status: 'Scheduled' }
    ];
  }

  protected fleetMaintenanceStatusClass(status: FleetMaintenanceRow['status']): string {
    return status === 'Completed' ? 'fleet-detail-pill-success' : 'fleet-detail-pill-warn';
  }

  private fleetCostDistribution(vehicle: FleetVehicle): FleetCostDistributionPoint[] {
    const items = this.fleetCostItems(vehicle);
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return items.map((item) => ({
      label: item.label,
      displayLabel: `${Math.round((item.value / total) * 100)}%`,
      percentage: `${Math.round((item.value / total) * 100)}%`,
      value: item.value,
      tone: item.tone
    }));
  }

  private fleetTotalCost(vehicle: FleetVehicle): string {
    const total = this.fleetCostItems(vehicle).reduce((sum, item) => sum + item.value, 0);
    return `$${total.toLocaleString('en-US')}`;
  }

  private fleetTopCostCategory(distribution: readonly FleetCostDistributionPoint[]): string {
    const top = distribution.reduce((max, point) => (point.value > max.value ? point : max));
    return `${top.label} \u00b7 ${top.percentage}`;
  }

  private fleetPeakSpendMonth(monthlySpend: readonly FleetMonthlySpendPoint[]): string {
    const peak = monthlySpend.reduce((max, point) => (point.spend > max.spend ? point : max));
    return `${peak.month} \u00b7 $${peak.spend.toLocaleString('en-US')}`;
  }

  private fleetMonthlyOperatingSpend(vehicle: FleetVehicle): FleetMonthlySpendPoint[] {
    const seed = this.fleetSeed(vehicle);
    const seasonalBase = [118, 148, 208, 238, 218, 258, 278, 208, 188, 228, 208, 178];
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
      const variability = ((seed + index * 7) % 5) * 10;
      const maintenanceAdjustment = vehicle.status === 'In Maintenance' && (index === 6 || index === 7) ? 22 : 0;
      const utilizationAdjustment = vehicle.status === 'Available' && index >= 8 ? -12 : 0;
      return { month, spend: seasonalBase[index] + variability + maintenanceAdjustment + utilizationAdjustment };
    });
  }

  protected fleetCostToneClass(tone: FleetCostItem['tone']): string {
    return `fleet-cost-tone-${tone}`;
  }

  private fleetUtilizationSummary(vehicle: FleetVehicle): { rate: string; activeHours: string; idleHours: string; trips: number } {
    const seed = this.fleetSeed(vehicle);
    const rateValue = Math.max(52, 76 - (vehicle.status === 'In Maintenance' ? 9 : 0) - (vehicle.status === 'Available' ? 4 : 0) + (seed % 5));
    const activeHours = 92 + (seed % 16) * 2;
    const idleHours = Math.max(18, 44 - (seed % 7) * 2 + (vehicle.status === 'Available' ? 8 : 0));
    return { rate: `${rateValue}%`, activeHours: `${activeHours}h`, idleHours: `${idleHours}h`, trips: 18 + (seed % 8) };
  }

  private fleetUtilizationSeries(vehicle: FleetVehicle): FleetUtilizationComparisonPoint[] {
    const seed = this.fleetSeed(vehicle);
    const priorBase = 160 + (seed % 5) * 14;
    const uplift = 18 + (seed % 4) * 9;

    return [
      { month: 'Jan', priorYear: priorBase, currentYear: priorBase + 42 },
      { month: 'Feb', priorYear: priorBase + 22, currentYear: priorBase + 4 },
      { month: 'Mar', priorYear: priorBase + 140, currentYear: priorBase + 118 },
      { month: 'Apr', priorYear: priorBase + 316, currentYear: priorBase + 278 },
      { month: 'May', priorYear: priorBase + 418, currentYear: priorBase + 472 },
      { month: 'Jun', priorYear: priorBase + 502, currentYear: priorBase + 564 },
      { month: 'Jul', priorYear: priorBase + 560, currentYear: priorBase + 586 + (vehicle.status === 'In Maintenance' ? -24 : uplift) },
      { month: 'Aug', priorYear: priorBase + 594, currentYear: priorBase + 650 + (vehicle.status === 'Available' ? -22 : uplift) },
      { month: 'Sep', priorYear: priorBase + 506, currentYear: priorBase + 480 + (vehicle.status === 'Available' ? -38 : 0) },
      { month: 'Oct', priorYear: priorBase + 442, currentYear: priorBase + 646 },
      { month: 'Nov', priorYear: priorBase + 154, currentYear: priorBase + 354 },
      { month: 'Dec', priorYear: priorBase + 52, currentYear: priorBase + 198 }
    ];
  }

  protected readonly fleetCurrencyAxisLabel = (value: unknown): string => `$${Number(value).toLocaleString('en-US')}`;

  // Chart enums, for the template bindings.
  protected readonly CategoryChartType = CategoryChartType;
  protected readonly LabelsPosition = LabelsPosition;
  protected readonly Visibility = Visibility;

  private fleetUtilizationYoY(vehicle: FleetVehicle): string {
    const series = this.fleetUtilizationSeries(vehicle);
    const prior = series.reduce((total, point) => total + point.priorYear, 0);
    const current = series.reduce((total, point) => total + point.currentYear, 0);
    if (prior === 0) return '';

    const change = ((current - prior) / prior) * 100;
    return `${change >= 0 ? '\u2191' : '\u2193'} ${Math.abs(change).toFixed(1)}% YoY`;
  }

  /**
   * The photo and the colour both come from `vehicle.photoKey`, so they cannot
   * contradict each other. An empty string means "no photo to show" - the
   * catalog has not loaded, does not carry the folder, or every shot in it
   * failed - and the template draws a neutral placeholder rather than a
   * stand-in car whose colour would be a lie.
   */
  protected fleetVehiclePhotoUrl(vehicle: FleetVehicle): string {
    if (this.fleetVehiclesWithoutPhoto().has(vehicle.id)) return '';
    return this.fleetData.vehiclePhotoUrls(vehicle)[0] ?? '';
  }

  protected fleetVehicleColor(vehicle: FleetVehicle): FleetPaintColor {
    return this.fleetData.vehicleColor(vehicle);
  }

  /** Colour first, so the alt text says what the picture shows. */
  protected fleetVehiclePhotoAlt(vehicle: FleetVehicle): string {
    return `${this.fleetData.vehicleColor(vehicle).name} ${vehicle.make} ${vehicle.model}`;
  }

  /**
   * Steps to the next shot in the pinned folder. Every file there is the same
   * car, so a fallback changes the angle and never the colour.
   */
  protected onFleetVehicleImageError(event: Event, vehicle: FleetVehicle): void {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    const photoUrls = this.fleetData.vehiclePhotoUrls(vehicle);
    const nextIndex = Number(target.dataset['photoIndex'] ?? '0') + 1;

    if (nextIndex >= photoUrls.length) {
      this.fleetVehiclesWithoutPhoto.update((ids) => new Set(ids).add(vehicle.id));
      return;
    }

    target.dataset['photoIndex'] = String(nextIndex);
    target.src = photoUrls[nextIndex];
  }

  private fleetCostItems(vehicle: FleetVehicle): FleetCostItem[] {
    const seed = this.fleetSeed(vehicle);
    const maintenanceBase = vehicle.status === 'In Maintenance' ? 520 : 280;

    return [
      { label: 'Fuel / charging', value: 360 + (seed % 5) * 26, tone: 'fuel' },
      { label: 'Maintenance', value: maintenanceBase + (seed % 4) * 25, tone: 'maintenance' },
      { label: 'Insurance', value: 180 + (seed % 3) * 30, tone: 'insurance' },
      { label: 'Tolls & fees', value: 54 + (seed % 6) * 7, tone: 'tolls' }
    ];
  }

  private fleetSeed(vehicle: FleetVehicle): number {
    return Number(vehicle.id.replace(/\D/g, '')) || 1;
  }

  private fleetCity(vehicle: FleetVehicle): string {
    return vehicle.locationCity.split(',')[0];
  }

  private fleetMileageValue(vehicle: FleetVehicle): number {
    return Number(vehicle.specs.mileage.replace(/[^\d]/g, '')) || 0;
  }

  private nextServiceMileage(vehicle: FleetVehicle): number {
    const mileage = this.fleetMileageValue(vehicle);
    return Math.ceil((mileage + 3200) / 5000) * 5000;
  }

  private fleetDriverName(vehicle: FleetVehicle, offset: number): string {
    const drivers = ['M. Alvarez', 'R. Chen', 'S. Patel', 'J. Walker', 'A. Brooks', 'T. Nguyen'];
    return drivers[(this.fleetSeed(vehicle) + offset) % drivers.length];
  }

  private formatWholeNumber(value: number): string {
    return Math.round(value).toLocaleString('en-US');
  }

  private formatOneDecimal(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
}
