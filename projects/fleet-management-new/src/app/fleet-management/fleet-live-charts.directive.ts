import { DestroyRef, Directive, EmbeddedViewRef, TemplateRef, ViewContainerRef, afterNextRender, effect, inject, input, untracked } from '@angular/core';
import { IgxGridComponent } from 'igniteui-angular/grids/grid';

export interface FleetLiveChartsContext<T> {
  $implicit: T;
  fleetLiveCharts: T;
}

/**
 * How long a detail's charts outlast the detail leaving the page. It covers
 * scrolling an expanded row out of view and back, which then shows the charts
 * as they were instead of building all three again.
 */
const FLEET_CHART_RELEASE_DELAY_MS = 5000;

interface FleetGridWatch {
  observer: MutationObserver;
  listeners: Set<() => void>;
}

/** One watch per grid, shared by the charts of every detail in it. */
const fleetGridWatches = new WeakMap<HTMLElement, FleetGridWatch>();

/**
 * Calls `listener` whenever elements are added to or removed from the grid,
 * until the returned function is called. However many charts the grid's
 * details hold, they share one MutationObserver, which disconnects when the
 * last of them stops listening.
 */
function watchGrid(grid: HTMLElement, listener: () => void): () => void {
  let watch = fleetGridWatches.get(grid);
  if (!watch) {
    const listeners = new Set<() => void>();
    const observer = new MutationObserver(() => listeners.forEach((notify) => notify()));
    observer.observe(grid, { childList: true, subtree: true });
    watch = { observer, listeners };
    fleetGridWatches.set(grid, watch);
  }

  const { observer, listeners } = watch;
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      observer.disconnect();
      fleetGridWatches.delete(grid);
    }
  };
}

/**
 * Stamps the charts of a vehicle's detail for one chart palette, and only
 * while that detail is part of the page.
 *
 * The palette is stamped rather than bound because the chart engine reads its
 * tooltip styling table once, while a chart is being constructed: a new
 * palette has to build the charts afresh, which happens here whenever the
 * bound value changes.
 *
 * The page part matters because a chart polls its own size every 100 ms until
 * it is destroyed, and the grid keeps a detail row's view for as long as the
 * grid lives. When the row collapses, scrolls out of the viewport or is
 * replaced by a new data record, the grid detaches the view and keeps it, so
 * it can put it back as it was. Left alone, every row ever expanded would keep
 * its three charts polling for as long as the sample is open. So this watches
 * the grid's DOM, destroys the charts once their detail has been out of the
 * document for `FLEET_CHART_RELEASE_DELAY_MS`, and stamps them again when the
 * grid puts the detail back. A detail that comes back sooner, as one scrolled
 * out of view and back does, finds its charts as it left them. Everything else
 * in the detail, such as the selected tab, stays as kept.
 *
 * The detail rather than the chart's own place is what counts: the tabs build
 * every panel but only insert the selected one, and the charts of the other
 * panels stay built so that switching tabs shows them at once.
 */
@Directive({
  selector: '[fleetLiveCharts]'
})
export class FleetLiveChartsDirective<T> {
  private readonly template = inject<TemplateRef<FleetLiveChartsContext<T>>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly grid = inject(IgxGridComponent);

  /** The palette the charts are stamped with; a new one rebuilds them. */
  public readonly fleetLiveCharts = input.required<T>();

  /** The detail the charts belong to; they live while it is in the document. */
  public readonly fleetLiveChartsWithin = input.required<HTMLElement>();

  /** The palette the charts on hand were built with. */
  private stampedPalette?: T;
  private releaseTimer?: ReturnType<typeof setTimeout>;
  private unwatch?: () => void;

  public static ngTemplateContextGuard<T>(_directive: FleetLiveChartsDirective<T>, _context: unknown): _context is FleetLiveChartsContext<T> {
    return true;
  }

  constructor() {
    // A new palette rebuilds the charts on hand. Charts stamped later take
    // whichever palette is bound by then.
    effect(() => {
      const palette = this.fleetLiveCharts();
      untracked(() => {
        if (this.viewContainer.length > 0 && palette !== this.stampedPalette) {
          this.viewContainer.clear();
          this.stamp(palette);
        }
      });
    });

    // Detail rows only render in the browser, after the grid has measured
    // itself, so nothing is stamped before the first render tells whether the
    // detail is on the page.
    afterNextRender(() => {
      this.unwatch = watchGrid(this.grid.nativeElement, () => this.sync());
      this.sync();
    });

    inject(DestroyRef).onDestroy(() => {
      this.unwatch?.();
      clearTimeout(this.releaseTimer);
    });
  }

  private sync(): void {
    const stamped = this.viewContainer.length > 0;

    if (this.fleetLiveChartsWithin().isConnected) {
      clearTimeout(this.releaseTimer);
      this.releaseTimer = undefined;
      if (!stamped) {
        // The detail's own view may still be detached from change detection
        // at this point, so the charts are checked here rather than left to
        // the next application tick.
        this.stamp(this.fleetLiveCharts()).detectChanges();
      }
    } else if (stamped && this.releaseTimer === undefined) {
      this.releaseTimer = setTimeout(() => this.release(), FLEET_CHART_RELEASE_DELAY_MS);
    }
  }

  private release(): void {
    this.releaseTimer = undefined;
    if (!this.fleetLiveChartsWithin().isConnected) {
      this.viewContainer.clear();
    }
  }

  private stamp(palette: T): EmbeddedViewRef<FleetLiveChartsContext<T>> {
    this.stampedPalette = palette;
    return this.viewContainer.createEmbeddedView(this.template, { $implicit: palette, fleetLiveCharts: palette });
  }
}
