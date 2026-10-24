import { Signal, effect } from '@angular/core';

/** The part of `IgxGridComponent` a live grid needs. */
interface RefreshableGrid {
  markForCheck(): void;
}

/**
 * Keeps a grid's rendered cells in step with row objects that are mutated in
 * place, without touching its `[data]` binding.
 *
 * Replacing the data array on every price tick makes `igx-grid` rebuild its row
 * cache and re-measure the virtualised viewport, which shows up as a flickering
 * scrollbar. `markForCheck()` is the grid's own answer to this: mutate the
 * records, then ask it to re-render the rows currently on screen.
 *
 * Call from a component's constructor (it needs an injection context):
 *
 * ```ts
 * private readonly grid = viewChild<IgxGridComponent>('myGrid');
 * constructor() {
 *   refreshOnTick(this.grid, this.market.tick);
 * }
 * ```
 */
export function refreshOnTick(
  grid: Signal<RefreshableGrid | undefined>,
  version: Signal<number>,
): void {
  effect(() => {
    version();
    grid()?.markForCheck();
  });
}
