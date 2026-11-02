import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { IGX_ACTION_STRIP_DIRECTIVES } from 'igniteui-angular/action-strip';
import { IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxCsvExporterService, IgxExcelExporterService } from 'igniteui-angular/grids/core';
import { IGX_GRID_DIRECTIVES, IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IGX_LIST_DIRECTIVES } from 'igniteui-angular/list';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import {
  IGX_SIMPLE_COMBO_DIRECTIVES,
  ISimpleComboSelectionChangingEventArgs,
  IgxSimpleComboComponent,
} from 'igniteui-angular/simple-combo';
import { TRADABLE_SYMBOLS } from '../data/market-seed';
import { StockItem } from '../models/stock.model';
import { MarketDataService } from '../services/market-data.service';
import { WorkspaceService } from '../services/workspace.service';
import { rangePosition } from '../util/finance';
import { refreshOnTick } from '../util/live-grid';
import { FINANCE_PIPES } from '../util/finance.pipes';

const MOVER_TABS = ['Gainers', 'Losers', 'Most Active'] as const;
type MoverTab = (typeof MOVER_TABS)[number];

/** How many rows each movers tab shows. */
const MOVERS_LIMIT = 5;

/** Row context handed to the action strip by the grid. */
interface RowContext {
  data?: StockItem;
}

@Component({
  selector: 'app-watchlist',
  imports: [
    IGX_GRID_DIRECTIVES,
    IGX_ACTION_STRIP_DIRECTIVES,
    IGX_SIMPLE_COMBO_DIRECTIVES,
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_TABS_DIRECTIVES,
    IGX_LIST_DIRECTIVES,
    IgxIconComponent,
    IgxIconButtonDirective,
    FINANCE_PIPES,
  ],
  providers: [IgxCsvExporterService, IgxExcelExporterService],
  templateUrl: './watchlist.html',
  styleUrl: './watchlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistComponent implements AfterViewInit {
  private readonly market = inject(MarketDataService);
  private readonly workspace = inject(WorkspaceService);

  readonly moverTabs = MOVER_TABS;
  /** Index rather than name: `igx-tabs` drives selection by index. */
  readonly activeMoverIndex = signal(0);
  private readonly activeMoverTab = computed<MoverTab>(() => MOVER_TABS[this.activeMoverIndex()]);
  readonly selectedSymbol = this.workspace.selectedSymbol;
  readonly searchQuery = this.workspace.searchQuery;

  private readonly grid = viewChild<IgxGridComponent>('watchlistGrid');

  /** The watchlist joined against the live feed, in the trader's own order. */
  private readonly quotes = computed(() =>
    this.workspace.watchlist()
      .map(symbol => this.market.quoteOf(symbol))
      .filter((quote): quote is StockItem => quote !== undefined),
  );

  /**
   * The grid's `[data]`. Deliberately independent of the price tick: these are
   * the live quote objects, so a new price shows up through `markForCheck()`
   * rather than a new array - which would make the grid re-measure and its
   * scrollbar flicker once a second.
   */
  readonly rows = computed(() => {
    const query = this.workspace.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.quotes();
    }

    return this.quotes().filter(quote =>
      `${quote.symbol} ${quote.name} ${quote.sector}`.toLowerCase().includes(query),
    );
  });

  /** Bound to the grid so the shared symbol and the highlighted row cannot drift. */
  readonly selectedRows = computed(() => [this.selectedSymbol()]);

  /** Recomputed per tick: the ordering, unlike the grid, is price-dependent. */
  readonly movers = computed(() => {
    this.market.tick();
    const rows = this.rows();

    switch (this.activeMoverTab()) {
      case 'Gainers':
        return rows.filter(row => row.changePct > 0)
          .sort((a, b) => b.changePct - a.changePct)
          .slice(0, MOVERS_LIMIT);
      case 'Losers':
        return rows.filter(row => row.changePct < 0)
          .sort((a, b) => a.changePct - b.changePct)
          .slice(0, MOVERS_LIMIT);
      default:
        return [...rows].sort((a, b) => b.volume - a.volume).slice(0, MOVERS_LIMIT);
    }
  });

  /**
   * The whole universe, each entry flagged with whether it is already watched.
   *
   * Watched symbols stay in the list rather than being filtered out: the
   * drop-down then reads the same every time, and "already added" is stated
   * rather than left to be inferred from an absence.
   */
  readonly symbolOptions = computed(() => {
    const watched = new Set(this.workspace.watchlist());
    return TRADABLE_SYMBOLS.map(symbol => ({ symbol, added: watched.has(symbol) }));
  });

  readonly rangePosition = rangePosition;

  private readonly addCombo = viewChild.required<IgxSimpleComboComponent>('addCombo');

  /**
   * How the template declares each column, captured before the trader can touch
   * the toolbar's hide and pin menus.
   */
  private readonly columnDefaults = new Map<string, { hidden: boolean; pinned: boolean }>();

  constructor() {
    refreshOnTick(this.grid, this.market.tick);

    // Hiding, pinning, sorting and filtering live on the grid's own columns,
    // out of reach of the workspace, so a reset has to restore them here.
    effect(() => {
      if (this.workspace.resetToken() === 0) {
        return;
      }

      untracked(() => this.restoreColumns());
    });
  }

  ngAfterViewInit(): void {
    // Read here rather than in the constructor: the grid resolves its columns
    // from projected content, so they do not exist until the view is built.
    for (const column of this.grid()?.columnList ?? []) {
      this.columnDefaults.set(column.field, { hidden: column.hidden, pinned: column.pinned });
    }
  }

  /**
   * Puts the columns back as declared.
   *
   * Properties are flipped on the live columns rather than replayed through
   * `IgxGridStateDirective`: restoring state there rebuilds the column
   * collection, which would drop the `igxCell` templates every column in this
   * grid depends on.
   */
  private restoreColumns(): void {
    const grid = this.grid();
    if (!grid) {
      return;
    }

    for (const column of grid.columnList) {
      const preset = this.columnDefaults.get(column.field);
      if (!preset) {
        continue;
      }

      if (column.pinned !== preset.pinned) {
        if (preset.pinned) {
          column.pin();
        } else {
          column.unpin();
        }
      }

      column.hidden = preset.hidden;
    }

    grid.clearSort();
    grid.clearFilter();
  }

  focusSymbol(symbol: string | undefined): void {
    if (symbol) {
      this.workspace.focusSymbol(symbol);
    }
  }

  updateSearchQuery(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.workspace.updateSearchQuery(target.value);
    }
  }

  /**
   * Enter opens a chart for the first row the filter leaves - the rows the
   * trader can actually see, rather than a match against the whole universe.
   */
  submitSearch(): void {
    this.focusSymbol(this.rows()[0]?.symbol);
  }

  removeFromWatchlist(symbol: string | undefined): void {
    if (symbol) {
      this.workspace.removeFromWatchlist(symbol);
    }
  }

  /**
   * The combo is a picker rather than a value holder: it fires the add and keeps
   * no selection.
   *
   * The cancel matters. On open the combo seeds its filter from the selected
   * item's display text (`searchValue = filterValue = _displayValue`), so a
   * retained selection filters the next open by that symbol and the drop-down
   * shows only it.
   */
  addSymbol(event: ISimpleComboSelectionChangingEventArgs): void {
    event.cancel = true;

    const symbol = event.newValue;
    if (typeof symbol !== 'string' || !symbol || this.workspace.isWatched(symbol)) {
      return;
    }

    this.workspace.addToWatchlist(symbol);
    this.workspace.selectSymbol(symbol);
    this.addCombo().close();
  }

  /** Narrows the action strip's untyped row context down to a symbol. */
  symbolOf(context: RowContext | undefined): string | undefined {
    return context?.data?.symbol;
  }
}
