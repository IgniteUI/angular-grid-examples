import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { CurrencyPipe, isPlatformServer } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IgxGridComponent, IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import {
  IColumnExportingEventArgs,
  IgxExporterEvent,
  IgxPdfExporterOptions,
  IgxPdfExporterService
} from 'igniteui-angular/grids/core';
import { IgxOverlayOutletDirective, OverlaySettings } from 'igniteui-angular/core';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxFocusDirective, IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IGX_BUTTON_GROUP_DIRECTIVES, IButtonGroupEventArgs } from 'igniteui-angular/button-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { CONTRACT_TYPES, FinjsDataService, REGIONS } from '../services/finjs-data.service';

type FinjsSize = 'small' | 'medium' | 'large';
type FinjsTheme = 'light' | 'dark';

const FINJS_DEFAULT_SIZE: FinjsSize = 'medium';
const FINJS_DEFAULT_THEME: FinjsTheme = 'light';

/** `1000000` -> `1M`, `100000` -> `100K`. Whole units only; the counts are round. */
function formatRowCount(count: number): string {
  if (count >= 1_000_000) return `${count / 1_000_000}M rows`;
  if (count >= 1_000) return `${count / 1_000}K rows`;
  return `${count} rows`;
}

@Component({
  selector: 'app-grid-finjs-100k',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IGX_GRID_DIRECTIVES,
    IgxOverlayOutletDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxFocusDirective,
    IgxButtonDirective,
    IgxIconButtonDirective,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IgxIconComponent,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './grid-finjs-100k.component.html',
  styleUrl: './grid-finjs-100k.component.scss',
  host: {
    '[class.dark-theme]': 'isDark()',
    '[class.finjs-size-small]': "finjsSize() === 'small'",
    '[class.finjs-size-large]': "finjsSize() === 'large'"
  }
})
export class GridFinjs100KComponent {
  private readonly pdfExportService = inject(IgxPdfExporterService);
  private readonly finjsData = inject(FinjsDataService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * True while the page is prerendered on the server. `igx-grid` reports "Grid
   * has no data." whenever it is not in a browser, so the prerendered grid
   * shows its loading indicator instead, until the browser renders the rows.
   */
  protected readonly prerendering = isPlatformServer(inject(PLATFORM_ID));

  protected readonly grid = viewChild.required<IgxGridComponent>('grid');
  protected readonly outlet = viewChild.required(IgxOverlayOutletDirective);

  protected readonly rows = this.finjsData.rows;
  protected readonly contracts = CONTRACT_TYPES;
  protected readonly regions = REGIONS;
  protected readonly columnFormat = { digitsInfo: '1.3-3' };
  protected readonly columnFormatChangeP = { digitsInfo: '3.3-3' };
  protected readonly overlaySettings: OverlaySettings = { modal: false };

  protected readonly finjsSizes: readonly FinjsSize[] = ['small', 'medium', 'large'];
  protected readonly finjsSize = signal<FinjsSize>(FINJS_DEFAULT_SIZE);

  protected readonly finjsTheme = signal<FinjsTheme>(FINJS_DEFAULT_THEME);
  protected readonly isDark = computed(() => this.finjsTheme() === 'dark');

  /**
   * Read off the data rather than written into the template, so the toolbar
   * cannot claim a row count the service is not generating.
   */
  protected readonly rowCountLabel = computed(() => formatRowCount(this.rows.length));

  private appliedSize: FinjsSize = FINJS_DEFAULT_SIZE;

  constructor() {
    afterNextRender(() => {
      this.overlaySettings.outlet = this.outlet();
    });

    // Row height derives from --ig-size, and at this row count the grid is
    // fully virtualized - it caches the height it measured and will keep
    // scrolling against the old one until told otherwise. The first run is
    // skipped because the grid measures itself on init and cannot reflow
    // before that.
    effect(() => {
      const size = this.finjsSize();
      if (size === this.appliedSize) return;

      this.appliedSize = size;
      this.grid().reflow();
    });
  }

  protected onFinjsSizeSelected(event: IButtonGroupEventArgs): void {
    const size = this.finjsSizes[event.index];
    if (size) {
      this.finjsSize.set(size);
    }
  }

  protected toggleTheme(): void {
    this.finjsTheme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  /** Grid cell classes reflecting the magnitude/direction of the daily percent change. */
  protected readonly trends = {
    positive: (rowData: { changeP: number }): boolean => rowData.changeP > 0,
    negative: (rowData: { changeP: number }): boolean => rowData.changeP < 0,
    changePos: (rowData: { changeP: number }): boolean => rowData.changeP > 0 && rowData.changeP < 1,
    changeNeg: (rowData: { changeP: number }): boolean => rowData.changeP < 0 && rowData.changeP > -1,
    strongPositive: (rowData: { changeP: number }): boolean => rowData.changeP >= 1,
    strongNegative: (rowData: { changeP: number }): boolean => rowData.changeP <= -1
  };
  private exportFilterConfigured = false;
  private readonly includedFields = new Set([
    'id', 'category', 'type', 'contract', 'settlement', 'country', 'region',
    'lastUpdated', 'openPrice', 'price', 'change', 'changeP', 'buy', 'sell'
  ]);

  protected rowSelectionChanged(): void {
    this.grid().clearCellSelection();
  }

  protected exportStarted(args: IgxExporterEvent): void {
    if ('pageSize' in args.options) {
      (args.options as IgxPdfExporterOptions).pageSize = 'A3';
    }

    if (this.exportFilterConfigured) {
      return;
    }
    this.exportFilterConfigured = true;

    // The exporter is a root service that every grid in the application shares, so the filter
    // lives only as long as this grid: left subscribed, it would keep the destroyed sample alive
    // and strip the columns from the next sample's PDF export.
    this.pdfExportService.columnExporting
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((exportArgs: IColumnExportingEventArgs) => {
        if (!this.includedFields.has(exportArgs.field)) {
          exportArgs.cancel = true;
        }
      });
  }
}
