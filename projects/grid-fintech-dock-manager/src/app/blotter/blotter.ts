import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IGX_ACTION_STRIP_DIRECTIVES } from 'igniteui-angular/action-strip';
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IChipSelectEventArgs, IGX_CHIPS_DIRECTIVES } from 'igniteui-angular/chips';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { Order, OrderStatus } from '../models/stock.model';
import { TradingService } from '../services/trading.service';
import { WorkspaceService } from '../services/workspace.service';
import { FINANCE_PIPES } from '../util/finance.pipes';

const STATUS_FILTERS = ['All', 'Working', 'Filled', 'Cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/** An order plus the single price the blotter shows for it. */
interface BlotterRow extends Order {
  /** Fill price once filled, otherwise the resting limit or stop. */
  displayPrice: number | null;
  priceKind: 'Fill' | 'Limit' | 'Stop' | 'Trail' | 'Mkt';
}

interface RowContext {
  data?: BlotterRow;
}

@Component({
  selector: 'app-blotter',
  imports: [
    IGX_GRID_DIRECTIVES,
    IGX_ACTION_STRIP_DIRECTIVES,
    IGX_CHIPS_DIRECTIVES,
    IgxBadgeComponent,
    IgxButtonDirective,
    IgxIconComponent,
    IgxIconButtonDirective,
    FINANCE_PIPES,
  ],
  templateUrl: './blotter.html',
  styleUrl: './blotter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlotterComponent {
  private readonly trading = inject(TradingService);
  private readonly workspace = inject(WorkspaceService);

  readonly statusFilters = STATUS_FILTERS;
  readonly activeFilter = signal<StatusFilter>('All');
  readonly workingCount = computed(() => this.trading.workingOrders().length);

  readonly rows = computed<BlotterRow[]>(() => {
    const filter = this.activeFilter();
    return this.trading.orders()
      .filter(order => filter === 'All' || order.status === filter)
      .map(toBlotterRow);
  });

  /** Per-status counts for the filter chips. */
  readonly counts = computed(() => {
    const orders = this.trading.orders();
    return {
      All: orders.length,
      Working: countBy(orders, 'Working'),
      Filled: countBy(orders, 'Filled'),
      Cancelled: countBy(orders, 'Cancelled') + countBy(orders, 'Rejected'),
    } satisfies Record<StatusFilter, number>;
  });

  /**
   * Single-choice filter, which `igx-chip` does not model on its own.
   *
   * `changeSelection` runs for the `[selected]` input as well as for a click and
   * emits `selectedChanging` either way, so the binding writing back to the
   * other chips would re-enter here. `originalEvent` is set only for a click.
   *
   * A filter is always applied, so clicking the active chip is cancelled rather
   * than clearing the selection.
   */
  onFilterChipSelect(filter: StatusFilter, event: IChipSelectEventArgs): void {
    if (!event.originalEvent) {
      return;
    }

    if (!event.selected) {
      event.cancel = true;
      return;
    }

    this.activeFilter.set(filter);
  }

  /** Order status -> badge colour. */
  badgeType(status: OrderStatus): 'warning' | 'success' | 'error' | 'primary' {
    switch (status) {
      case 'Working':
        return 'warning';
      case 'Filled':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'primary';
    }
  }

  selectSymbol(symbol: string | undefined): void {
    if (symbol) {
      this.workspace.selectSymbol(symbol);
    }
  }

  cancel(context: RowContext | undefined): void {
    const order = context?.data;
    if (order?.status === 'Working') {
      this.trading.cancelOrder(order.id);
    }
  }

  cancelAll(): void {
    this.trading.cancelAllWorking();
  }

  isWorking(context: RowContext | undefined): boolean {
    return context?.data?.status === 'Working';
  }
}

function toBlotterRow(order: Order): BlotterRow {
  if (order.status === 'Filled') {
    return { ...order, displayPrice: order.fillPrice, priceKind: 'Fill' };
  }

  switch (order.type) {
    case 'Market':
      return { ...order, displayPrice: null, priceKind: 'Mkt' };
    case 'Limit':
      return { ...order, displayPrice: order.limitPrice, priceKind: 'Limit' };
    case 'Trailing Stop':
      return { ...order, displayPrice: order.stopPrice, priceKind: 'Trail' };
    default:
      return { ...order, displayPrice: order.stopPrice ?? order.limitPrice, priceKind: 'Stop' };
  }
}

function countBy(orders: readonly Order[], status: OrderStatus): number {
  return orders.reduce((total, order) => total + (order.status === status ? 1 : 0), 0);
}
