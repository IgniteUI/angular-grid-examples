import {
  IgcContentPane,
  IgcDockManagerLayout,
  IgcDockManagerPane,
  IgcDockManagerPaneType,
  IgcDocumentHost,
  IgcSplitPaneOrientation,
  IgcTabGroupPane,
} from 'igniteui-dockmanager';

// -----------------------------------------------------------------------------
// Dock Manager layout: the default arrangement plus the small set of pure
// transforms the workspace needs (show/hide a pane, open a chart document).
//
// Every transform returns a NEW layout object so it can be fed straight into a
// signal, and so the Dock Manager sees a changed reference.
// -----------------------------------------------------------------------------

/** Content ids of the fixed (non-document) panes. */
export const DOCK_PANES = {
  watchlist: 'watchlist',
  orderTicket: 'orderTicket',
  positions: 'positions',
  blotter: 'blotter',
  news: 'news',
} as const;

export type DockPaneId = (typeof DOCK_PANES)[keyof typeof DOCK_PANES];

const FIXED_PANE_IDS: readonly string[] = Object.values(DOCK_PANES);

/** True for the docked panes the rail shows and hides, false for chart documents. */
export const isFixedPaneId = (contentId: string | null | undefined): boolean =>
  !!contentId && FIXED_PANE_IDS.includes(contentId);

const CHART_PREFIX = 'chart:';

export const chartContentId = (symbol: string): string => `${CHART_PREFIX}${symbol}`;
export const isChartContentId = (contentId: string): boolean => contentId.startsWith(CHART_PREFIX);
export const symbolOfChartPane = (contentId: string): string => contentId.slice(CHART_PREFIX.length);

const APP_SHELL_FIXED_WIDTH = 58;
const COMMAND_BAR_HEIGHT = 46;
const APP_CHROME_VERTICAL_BORDERS = 2;
const DOCK_SPLITTER_THICKNESS = 4;
/** Order Ticket over News, and the chart over Positions: one splitter each. */
const STACK_SPLITTER_COUNT = 1;
/**
 * Tall enough that the default ticket needs no scrolling.
 *
 * Budget, at Fluent's small size (button 24px, input group 32px) plus the Dock
 * Manager's 40px pane header: header 20 + ladder 40 + side group 24 + form 268
 * (two field rows at 46, quick-qty 24, estimate box 96, submit 24, gaps 32)
 * + the pane's own 9px gaps and 20px padding.
 *
 * The taller cases - Stop Limit showing a third field, or a rejection message -
 * are left to `overflow: auto` on `.ticket` rather than padded for here.
 */
const ORDER_TICKET_HEIGHT = 470;
/**
 * Enough for the summary row plus a few positions before it scrolls.
 *
 * The 0.6 cap on `positionsSize` below is what keeps this from eating the chart
 * on a short screen: at this height the cap starts binding under roughly a
 * 680px viewport, and the pane holds its fraction rather than its pixels from
 * there down.
 */
const POSITIONS_HEIGHT = 380;
/** Floor for the watchlist and the ticket/news stack alike. */
const MIN_SIDE_PANE_WIDTH = 260;
const MIN_CHART_WIDTH = 400;
const MIN_NEWS_HEIGHT = 120;
const MIN_STACK_HEIGHT = 42;
/** The watchlist carries the most columns, so it opens widest. */
const WATCHLIST_WIDTH = 670;
/**
 * The ticket and the news wire under it. 300 is what the ticket's two-column
 * form rows need (two fields at 110 plus their gap, inside 10px padding) and
 * nothing beyond that - the space is better spent on the chart.
 */
const RIGHT_STACK_WIDTH = 300;

/** Builds the pristine desk arrangement for the given viewport. */
export function buildDefaultLayout(
  viewportWidth: number,
  viewportHeight: number,
  chartSymbols: readonly string[],
): IgcDockManagerLayout {
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 1440;
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 900;

  const stackHeight = Math.max(1, height - COMMAND_BAR_HEIGHT - APP_CHROME_VERTICAL_BORDERS);
  const stackContentHeight = Math.max(1, stackHeight - STACK_SPLITTER_COUNT * DOCK_SPLITTER_THICKNESS);

  // Sizes within a split are relative to their siblings, so each stack is
  // expressed as the fraction its fixed-height pane wants.
  const ticketSize = Math.min(0.9, Math.max(0.05, ORDER_TICKET_HEIGHT / stackContentHeight));
  const newsSize = 1 - ticketSize;
  const positionsSize = Math.min(0.6, Math.max(0.15, POSITIONS_HEIGHT / stackContentHeight));
  const chartSize = 1 - positionsSize;

  // The watchlist gets its full width whenever the chart and the right stack
  // still clear their minimums beside it, and shares what is left when not.
  const usableWidth = Math.max(320, width - APP_SHELL_FIXED_WIDTH);
  const watchlistWidth = Math.min(
    WATCHLIST_WIDTH,
    Math.max(MIN_SIDE_PANE_WIDTH, usableWidth - MIN_CHART_WIDTH - MIN_SIDE_PANE_WIDTH),
  );
  const rightWidth = Math.min(
    RIGHT_STACK_WIDTH,
    Math.max(MIN_SIDE_PANE_WIDTH, usableWidth - watchlistWidth - MIN_CHART_WIDTH),
  );
  const chartWidth = Math.max(MIN_CHART_WIDTH, usableWidth - watchlistWidth - rightWidth);

  return {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.horizontal,
      panes: [
        {
          type: IgcDockManagerPaneType.contentPane,
          contentId: DOCK_PANES.watchlist,
          header: 'Watchlist',
          size: watchlistWidth,
          minResizeWidth: MIN_SIDE_PANE_WIDTH,
          allowPinning: false,
        },
        {
          // Charts on top, the book directly beneath them.
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: chartWidth,
          minResizeWidth: MIN_CHART_WIDTH,
          panes: [
            {
              type: IgcDockManagerPaneType.documentHost,
              size: chartSize,
              rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                allowEmpty: true,
                panes: [{
                  type: IgcDockManagerPaneType.tabGroupPane,
                  panes: chartSymbols.map(toChartPane),
                }],
              },
            },
            {
              type: IgcDockManagerPaneType.tabGroupPane,
              size: positionsSize,
              panes: [
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: DOCK_PANES.positions,
                  header: 'Positions & P&L',
                  minResizeHeight: MIN_STACK_HEIGHT,
                  allowPinning: false,
                },
                {
                  type: IgcDockManagerPaneType.contentPane,
                  contentId: DOCK_PANES.blotter,
                  header: 'Order Blotter',
                  minResizeHeight: MIN_STACK_HEIGHT,
                  allowPinning: false,
                },
              ],
            },
          ],
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: rightWidth,
          minResizeWidth: MIN_SIDE_PANE_WIDTH,
          minResizeHeight: ORDER_TICKET_HEIGHT + MIN_NEWS_HEIGHT,
          panes: [
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: DOCK_PANES.orderTicket,
              header: 'Order Ticket',
              size: ticketSize,
              minResizeHeight: ORDER_TICKET_HEIGHT,
              allowPinning: false,
            },
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: DOCK_PANES.news,
              header: 'News',
              size: newsSize,
              minResizeHeight: MIN_NEWS_HEIGHT,
              allowPinning: false,
            },
          ],
        },
      ],
    },
  };
}

function toChartPane(symbol: string): IgcContentPane {
  return {
    type: IgcDockManagerPaneType.contentPane,
    contentId: chartContentId(symbol),
    header: symbol,
    documentOnly: true,
  };
}

// -- Traversal ---------------------------------------------------------------

const isContentPane = (pane: IgcDockManagerPane): pane is IgcContentPane =>
  pane?.type === IgcDockManagerPaneType.contentPane;

const childrenOf = (pane: IgcDockManagerPane): IgcDockManagerPane[] => {
  switch (pane?.type) {
    case IgcDockManagerPaneType.splitPane:
    case IgcDockManagerPaneType.tabGroupPane:
      return pane.panes ?? [];
    case IgcDockManagerPaneType.documentHost:
      return pane.rootPane ? [pane.rootPane] : [];
    default:
      return [];
  }
};

/** Depth-first walk over every pane in the layout, docked and floating. */
export function forEachPane(layout: IgcDockManagerLayout, visit: (pane: IgcDockManagerPane) => void): void {
  const queue: IgcDockManagerPane[] = [layout.rootPane, ...(layout.floatingPanes ?? [])];

  while (queue.length > 0) {
    const pane = queue.pop();
    if (!pane) {
      continue;
    }

    visit(pane);
    queue.push(...childrenOf(pane));
  }
}

/** All content ids currently present in the layout. */
export function contentIdsOf(layout: IgcDockManagerLayout): string[] {
  const ids: string[] = [];
  forEachPane(layout, pane => {
    if (isContentPane(pane) && pane.contentId) {
      ids.push(pane.contentId);
    }
  });
  return ids;
}

/** Symbols of the chart documents currently open, in layout order. */
export function chartSymbolsOf(layout: IgcDockManagerLayout): string[] {
  return contentIdsOf(layout).filter(isChartContentId).map(symbolOfChartPane);
}

function findContentPane(layout: IgcDockManagerLayout, contentId: string): IgcContentPane | undefined {
  let match: IgcContentPane | undefined;
  forEachPane(layout, pane => {
    if (isContentPane(pane) && pane.contentId === contentId) {
      match = pane;
    }
  });
  return match;
}

/** `false` when the pane is absent or flagged hidden. */
export function isPaneVisible(layout: IgcDockManagerLayout, contentId: string): boolean {
  const pane = findContentPane(layout, contentId);
  return pane ? pane.hidden !== true : false;
}

// -- Transforms --------------------------------------------------------------

/**
 * A JSON round-trip, not `structuredClone`: the object being transformed may be
 * the Dock Manager's own layout, and this drops anything non-serialisable rather
 * than throwing - the same contract the persistence layer works under.
 */
export const cloneLayout = (layout: IgcDockManagerLayout): IgcDockManagerLayout =>
  JSON.parse(JSON.stringify(layout)) as IgcDockManagerLayout;

/** Shows or hides a docked pane without removing it from the layout. */
export function withPaneVisibility(
  layout: IgcDockManagerLayout,
  contentId: string,
  visible: boolean,
): IgcDockManagerLayout {
  const next = cloneLayout(layout);
  const pane = findContentPane(next, contentId);
  if (!pane) {
    return layout;
  }

  pane.hidden = !visible;
  return next;
}

/**
 * The tab group chart documents live in. Closing every chart leaves the host's
 * root split pane empty, so an empty group is created on demand - otherwise
 * "open chart" would be a dead end once the last tab was closed.
 */
function documentHostOf(layout: IgcDockManagerLayout): IgcDocumentHost | undefined {
  let host: IgcDocumentHost | undefined;
  forEachPane(layout, pane => {
    if (pane?.type === IgcDockManagerPaneType.documentHost) {
      host = pane;
    }
  });
  return host;
}

/**
 * Every tab group in the document host, in layout order.
 *
 * There is more than one as soon as the trader splits the host to watch two
 * instruments side by side, which is why nothing here may assume the first.
 */
function chartTabGroups(host: IgcDocumentHost): IgcTabGroupPane[] {
  const groups: IgcTabGroupPane[] = [];
  const queue: IgcDockManagerPane[] = host.rootPane ? [host.rootPane] : [];

  while (queue.length > 0) {
    const pane = queue.shift();
    if (pane?.type === IgcDockManagerPaneType.tabGroupPane) {
      // A tab group holds content panes, so there is nothing deeper to visit.
      groups.push(pane);
      continue;
    }
    queue.push(...childrenOf(pane));
  }

  return groups;
}

/**
 * Closing every chart leaves the host's root split empty, so a group is created
 * on demand - otherwise "open chart" would be a dead end once the last tab went.
 */
function appendChartTabGroup(host: IgcDocumentHost): IgcTabGroupPane | undefined {
  if (!host.rootPane) {
    return undefined;
  }

  const group: IgcTabGroupPane = { type: IgcDockManagerPaneType.tabGroupPane, panes: [] };
  host.rootPane.panes = [...(host.rootPane.panes ?? []), group];
  return group;
}

/**
 * Adds a chart document for `symbol` and selects it. If the chart is already
 * open its existing tab is selected instead - no duplicate panes.
 *
 * The search covers every tab group, not just the first. Once the host is split
 * a chart can live in either side, and appending a second pane with the same
 * `contentId` would not read as a duplicate: the shell renders one slot per
 * symbol, so the chart would vanish from the group it was dragged to and
 * reappear in the other one.
 */
export function withChartDocument(layout: IgcDockManagerLayout, symbol: string): IgcDockManagerLayout {
  const contentId = chartContentId(symbol);
  const next = cloneLayout(layout);
  const host = documentHostOf(next);

  if (!host) {
    return layout;
  }

  const groups = chartTabGroups(host);

  for (const group of groups) {
    const index = group.panes.findIndex(pane => pane.contentId === contentId);
    if (index >= 0) {
      group.panes[index].hidden = false;
      group.selectedIndex = index;
      return next;
    }
  }

  const target = groups[0] ?? appendChartTabGroup(host);
  if (!target) {
    return layout;
  }

  target.panes = [...target.panes, toChartPane(symbol)];
  target.selectedIndex = target.panes.length - 1;
  return next;
}

/**
 * Restores a persisted layout, dropping any pane whose content id the current
 * build no longer renders. Returns `null` when the payload is unusable - the
 * caller then falls back to {@link buildDefaultLayout}.
 */
export function parsePersistedLayout(raw: string, knownPaneIds: readonly string[]): IgcDockManagerLayout | null {
  try {
    const parsed = JSON.parse(raw) as IgcDockManagerLayout;
    if (!parsed?.rootPane) {
      return null;
    }

    const ids = contentIdsOf(parsed);
    const unknown = ids.some(id => !isChartContentId(id) && !knownPaneIds.includes(id));
    return unknown ? null : parsed;
  } catch {
    return null;
  }
}
