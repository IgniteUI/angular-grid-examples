import { Injectable, computed, effect, signal } from '@angular/core';
import { IgcDockManagerLayout } from 'igniteui-dockmanager';
import { DEFAULT_CHART_SYMBOLS, DEFAULT_WATCHLIST } from '../data/market-seed';
import { OrderSide } from '../models/stock.model';
import {
  DOCK_PANES,
  DockPaneId,
  buildDefaultLayout,
  chartSymbolsOf,
  isPaneVisible,
  parsePersistedLayout,
  withChartDocument,
  withPaneVisibility,
} from '../util/dock-layout';

export type ThemeMode = 'dark' | 'light';

/** A pane the nav rail can show or hide. */
export interface PaneToggle {
  id: DockPaneId;
  label: string;
  icon: string;
}

const LAYOUT_KEY = 'grid-fintech-dock-manager.layout';
const THEME_KEY = 'grid-fintech-dock-manager.theme';
const WATCHLIST_KEY = 'grid-fintech-dock-manager.watchlist';

const FALLBACK_VIEWPORT = { width: 1440, height: 900 };
const KNOWN_PANE_IDS = Object.values(DOCK_PANES);

/**
 * Session state for the desk: the Dock Manager layout, the selected instrument
 * that every pane follows, the watchlist and the theme. Layout, watchlist and
 * theme survive a reload, so a trader's arrangement is still there tomorrow.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly theme = signal<ThemeMode>(readStored(THEME_KEY, isThemeMode) ?? 'dark');
  readonly isDark = computed(() => this.theme() === 'dark');

  /** The instrument the order ticket, chart focus and news filter follow. */
  readonly selectedSymbol = signal<string>(DEFAULT_CHART_SYMBOLS[0]);
  /** Side the order ticket opens on - set by the Buy/Sell shortcuts in other panes. */
  readonly ticketSide = signal<OrderSide>('BUY');
  readonly searchQuery = signal('');
  /** Symbol the news wire is narrowed to; empty means the whole wire. */
  readonly newsFilter = signal('');

  readonly watchlist = signal<string[]>(readStored(WATCHLIST_KEY, isStringArray) ?? [...DEFAULT_WATCHLIST]);

  private readonly restoredLayout = parseStoredLayout();

  /**
   * The layout pushed *into* the Dock Manager. It changes only on programmatic
   * edits (open a chart, toggle a pane, reset) - never in response to a drag,
   * because re-assigning it mid-gesture would re-render the whole dock.
   */
  private readonly _layout = signal<IgcDockManagerLayout>(
    this.restoredLayout ?? buildDefaultLayout(FALLBACK_VIEWPORT.width, FALLBACK_VIEWPORT.height, DEFAULT_CHART_SYMBOLS),
  );
  readonly layout = this._layout.asReadonly();

  /**
   * The arrangement actually on screen. The Dock Manager edits its layout in
   * place, so this is a plain field rather than a signal; `revision` below is
   * what makes the derived state re-read it.
   */
  private live: IgcDockManagerLayout = this._layout();

  /** Bumped on every `layoutChange`, so `chartSymbols` and `visiblePanes` refresh. */
  private readonly revision = signal(0);

  /**
   * Bumped by {@link reset}. Panes holding state this service cannot reach -
   * a grid's own column layout, sorting and filters - watch this to put
   * themselves back.
   */
  private readonly _resetToken = signal(0);
  readonly resetToken = this._resetToken.asReadonly();

  /** The default arrangement is sized once, against the real viewport. */
  private sized = this.restoredLayout !== null;

  /** Chart documents currently open, read back out of the live layout. */
  readonly chartSymbols = computed(() => {
    this.revision();
    return chartSymbolsOf(this.live);
  });

  readonly paneToggles: readonly PaneToggle[] = [
    { id: DOCK_PANES.watchlist, label: 'Watchlist', icon: 'visibility' },
    { id: DOCK_PANES.orderTicket, label: 'Order Ticket', icon: 'add_shopping_cart' },
    { id: DOCK_PANES.positions, label: 'Positions', icon: 'account_balance_wallet' },
    { id: DOCK_PANES.blotter, label: 'Blotter', icon: 'assignment' },
    { id: DOCK_PANES.news, label: 'News', icon: 'newspaper' },
  ];

  /** Pane visibility, recomputed from the live layout so the rail cannot drift. */
  readonly visiblePanes = computed(() => {
    this.revision();
    return new Set(this.paneToggles.filter(pane => isPaneVisible(this.live, pane.id)).map(pane => pane.id));
  });

  constructor() {
    effect(() => writeStored(THEME_KEY, this.theme()));
    effect(() => writeStored(WATCHLIST_KEY, this.watchlist()));
  }

  toggleTheme(): void {
    this.theme.update(mode => (mode === 'dark' ? 'light' : 'dark'));
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  selectSymbol(symbol: string): void {
    this.selectedSymbol.set(symbol);
  }

  setNewsFilter(symbol: string): void {
    this.newsFilter.set(symbol);
  }

  /**
   * Points the whole desk at one instrument: it becomes the selection every
   * pane follows, its chart comes up, and the wire narrows to it.
   *
   * This is what clicking a watchlist row does - one gesture, and the panes
   * that can say something about that symbol all do.
   */
  focusSymbol(symbol: string): void {
    this.setNewsFilter(symbol);
    this.openChart(symbol);
  }

  /** Points the order ticket at an instrument and side in one gesture. */
  prepareOrder(symbol: string, side: OrderSide): void {
    this.selectedSymbol.set(symbol);
    this.ticketSide.set(side);
  }

  /** Selects the symbol and brings its chart document up, opening it if needed. */
  openChart(symbol: string): void {
    this.selectedSymbol.set(symbol);
    this.pushLayout(withChartDocument(this.live, symbol));
  }

  togglePane(id: DockPaneId): void {
    this.setPaneVisible(id, !this.visiblePanes().has(id));
  }

  /**
   * Idempotent counterpart to {@link togglePane}, for controls that report a
   * state rather than an intent - the rail's switches send `checked`, and
   * re-applying the state the layout is already in must not churn it.
   */
  setPaneVisible(id: DockPaneId, visible: boolean): void {
    if (this.visiblePanes().has(id) === visible) {
      return;
    }

    this.pushLayout(withPaneVisibility(this.live, id, visible));
  }

  /**
   * Adopts the arrangement the Dock Manager reports after a drag, dock or close.
   * The layout input is deliberately left untouched - only the derived state and
   * the saved copy move.
   */
  applyLayout(layout: IgcDockManagerLayout): void {
    this.live = layout;
    this.revision.update(value => value + 1);
    writeStored(LAYOUT_KEY, layout);
  }

  /**
   * Sizes the shipped default against the real viewport, once. Later resizes are
   * the Dock Manager's own business - rebuilding here would throw away whatever
   * arrangement the trader has since dragged into place.
   */
  initialiseViewport(width: number, height: number): void {
    if (this.sized) {
      return;
    }

    this.sized = true;
    this.pushLayout(buildDefaultLayout(width, height, this.chartSymbols()));
  }

  /**
   * Returns the whole workspace to its opening state - the arrangement plus the
   * watchlist, theme, selected instrument, ticket side and search box.
   *
   * The stored copies follow on their own: the `theme` and `watchlist` effects
   * re-persist the defaults, and {@link resetLayout} rewrites the saved layout.
   */
  reset(width: number, height: number): void {
    this.theme.set('dark');
    this.watchlist.set([...DEFAULT_WATCHLIST]);
    this.selectedSymbol.set(DEFAULT_CHART_SYMBOLS[0]);
    this.ticketSide.set('BUY');
    this.searchQuery.set('');
    this.newsFilter.set('');
    this.resetLayout(width, height);
    this._resetToken.update(value => value + 1);
  }

  /** Drops the saved arrangement and rebuilds the shipped default. */
  resetLayout(width: number, height: number): void {
    clearStored(LAYOUT_KEY);
    this.sized = true;
    this.pushLayout(buildDefaultLayout(width, height, DEFAULT_CHART_SYMBOLS));
  }

  /** Pushes a new arrangement into the Dock Manager and saves it. */
  private pushLayout(next: IgcDockManagerLayout): void {
    this.live = next;
    this.revision.update(value => value + 1);
    this._layout.set(next);
    writeStored(LAYOUT_KEY, next);
  }

  isWatched(symbol: string): boolean {
    return this.watchlist().includes(symbol);
  }

  addToWatchlist(symbol: string): void {
    this.watchlist.update(list => (list.includes(symbol) ? list : [symbol, ...list]));
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlist.update(list => list.filter(entry => entry !== symbol));
  }
}

// -- Persistence -------------------------------------------------------------
// Storage is best effort: a private-mode browser or a server render must not
// break the desk, so every access is guarded and falls back to the defaults.

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readStored<T>(key: string, guard: (value: unknown) => value is T): T | null {
  const raw = storage()?.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode - the desk keeps working in memory.
  }
}

function clearStored(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Nothing to do.
  }
}

function parseStoredLayout(): IgcDockManagerLayout | null {
  const raw = storage()?.getItem(LAYOUT_KEY);
  return raw ? parsePersistedLayout(raw, KNOWN_PANE_IDS) : null;
}

const isThemeMode = (value: unknown): value is ThemeMode => value === 'dark' || value === 'light';
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(entry => typeof entry === 'string');
