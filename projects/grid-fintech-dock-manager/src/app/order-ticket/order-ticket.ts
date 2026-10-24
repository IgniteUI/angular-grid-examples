import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IGX_BUTTON_GROUP_DIRECTIVES, IButtonGroupEventArgs } from 'igniteui-angular/button-group';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxSnackbarComponent } from 'igniteui-angular/snackbar';
import { ORDER_TYPES, OrderSide, OrderType, TIME_IN_FORCE, TimeInForce } from '../models/stock.model';
import { MarketDataService } from '../services/market-data.service';
import { COMMISSION_PER_SHARE, TradingService, commissionFor } from '../services/trading.service';
import { WorkspaceService } from '../services/workspace.service';
import { round2 } from '../util/finance';
import { FINANCE_PIPES } from '../util/finance.pipes';

/** Order types that rest on a limit price. */
const LIMIT_TYPES: readonly OrderType[] = ['Limit', 'Stop Limit'];
/** Order types that need a stop price or trail amount. */
const STOP_TYPES: readonly OrderType[] = ['Stop', 'Stop Limit', 'Trailing Stop'];

const QUICK_QUANTITIES = [25, 50, 100, 500] as const;

/** One segment of the quick-size group. */
interface QuickSize {
  label: string;
  quantity: number;
  disabled: boolean;
  hint?: string;
}

/**
 * The two sides, in the order the button group renders them - `selected` reports
 * the index, so this array is what turns that back into a side.
 */
const SIDE_OPTIONS: readonly { value: OrderSide; label: string }[] = [
  { value: 'BUY', label: 'Buy' },
  { value: 'SELL', label: 'Sell' },
];

@Component({
  selector: 'app-order-ticket',
  imports: [
    ReactiveFormsModule,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxButtonDirective,
    IGX_BUTTON_GROUP_DIRECTIVES,
    IgxIconComponent,
    IgxSnackbarComponent,
    FINANCE_PIPES,
  ],
  templateUrl: './order-ticket.html',
  styleUrl: './order-ticket.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTicketComponent {
  private readonly market = inject(MarketDataService);
  private readonly trading = inject(TradingService);
  private readonly workspace = inject(WorkspaceService);
  private readonly snackbar = viewChild.required<IgxSnackbarComponent>('ticketSnackbar');

  readonly orderTypes = ORDER_TYPES;
  readonly timesInForce = TIME_IN_FORCE;
  readonly sideOptions = SIDE_OPTIONS;

  /** Both driven by the shell, so any pane can point the ticket at a trade. */
  readonly symbol = this.workspace.selectedSymbol;
  readonly side = this.workspace.ticketSide;

  /**
   * A per-tick snapshot, not the live quote object: the feed writes prices in
   * place, so a computed returning the same reference would never propagate.
   */
  readonly quote = computed(() => {
    this.market.tick();
    return this.market.snapshotOf(this.symbol());
  });
  readonly heldQuantity = computed(() => {
    const symbol = this.symbol();
    return this.trading.positions().find(position => position.symbol === symbol)?.quantity ?? 0;
  });

  readonly form = new FormGroup({
    quantity: new FormControl(100, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    type: new FormControl<OrderType>('Limit', { nonNullable: true }),
    limitPrice: new FormControl<number | null>(null, Validators.min(0.01)),
    stopPrice: new FormControl<number | null>(null, Validators.min(0.01)),
    timeInForce: new FormControl<TimeInForce>('Day', { nonNullable: true }),
  });

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  readonly orderType = computed<OrderType>(() => this.formValue().type ?? 'Limit');
  readonly needsLimitPrice = computed(() => LIMIT_TYPES.includes(this.orderType()));
  readonly needsStopPrice = computed(() => STOP_TYPES.includes(this.orderType()));
  readonly isTrailing = computed(() => this.orderType() === 'Trailing Stop');

  /** Rejection returned by the engine, cleared as soon as the ticket is edited. */
  readonly rejection = signal<string | null>(null);

  /** The price this order would work against right now. */
  readonly referencePrice = computed(() => {
    const quote = this.quote();
    if (!quote) {
      return null;
    }

    const limit = this.formValue().limitPrice;
    if (this.needsLimitPrice() && limit) {
      return limit;
    }

    return this.side() === 'BUY' ? quote.ask : quote.bid;
  });

  readonly estimate = computed(() => {
    const quantity = this.formValue().quantity ?? 0;
    const price = this.referencePrice() ?? 0;
    const notional = round2(quantity * price);
    const commission = quantity > 0 ? commissionFor(quantity) : 0;

    return { quantity, notional, commission, total: round2(notional + commission) };
  });

  readonly buyingPower = this.trading.buyingPower;

  /** Largest size the account can support for the current side. */
  readonly maxQuantity = computed(() => {
    if (this.side() === 'SELL') {
      return this.heldQuantity();
    }

    // Commission is priced in, so "Max" is always a size the engine accepts.
    const price = this.referencePrice();
    return price && price > 0 ? Math.floor(this.buyingPower() / (price + COMMISSION_PER_SHARE)) : 0;
  });

  /**
   * The quick sizes, in the order the button group renders them - `selected`
   * reports an index, so this is what turns that back into a size. A computed
   * rather than a constant because `Max` carries a live size, and it is last so
   * that the fixed sizes keep their positions as it changes.
   */
  readonly quickSizes = computed<readonly QuickSize[]>(() => {
    const max = this.maxQuantity();

    return [
      ...QUICK_QUANTITIES.map(quantity => ({ label: `${quantity}`, quantity, disabled: false })),
      {
        label: 'Max',
        quantity: max,
        disabled: max < 1,

        // The only one whose size is not on its face, so it is the only one
        // that needs saying.
        hint: `Maximum size for this side: ${max}`,
      },
    ];
  });

  /**
   * Which quick size the field currently holds, or -1 for none of them.
   *
   * "None" is a real state - the quantity field takes any number, and a size
   * typed by hand should leave every button unlit - which is why the group is
   * `single` rather than the `singleRequired` the side toggle uses.
   *
   * First match wins. `Max` can land on a fixed size exactly (buying power
   * enough for 500 and no more), and two buttons claiming `selected` in a
   * single-select group is a fight the group resolves on its own terms; this
   * settles it on the fixed size, which is the one whose meaning does not move.
   */
  readonly selectedQuickSize = computed(() => {
    const quantity = this.formValue().quantity ?? 0;

    return this.quickSizes().findIndex(size => !size.disabled && size.quantity === quantity);
  });

  readonly canSubmit = computed(() => this.formStatus() === 'VALID' && this.quote() !== undefined);

  readonly submitLabel = computed(() => `${this.side() === 'BUY' ? 'Buy' : 'Sell'} ${this.symbol()}`);

  constructor() {
    // Following the selected symbol means re-seeding the price fields, otherwise
    // a limit left over from the previous instrument would be nonsense.
    effect(() => {
      const symbol = this.symbol();
      // `untracked` keeps this effect on symbol changes only - reading the quote
      // as a dependency would re-seed the field on every tick.
      const quote = untracked(() => this.market.quoteOf(symbol));
      if (!quote) {
        return;
      }

      this.form.patchValue(
        { limitPrice: quote.lastPrice, stopPrice: null },
        { emitEvent: false },
      );
      this.rejection.set(null);
    });

    // Price fields only validate while the chosen order type actually uses them.
    effect(() => {
      const type = this.orderType();
      toggle(this.form.controls.limitPrice, LIMIT_TYPES.includes(type));
      toggle(this.form.controls.stopPrice, STOP_TYPES.includes(type));
    });

    effect(() => {
      this.formValue();
      this.rejection.set(null);
    });
  }

  onSideSelected(event: IButtonGroupEventArgs): void {
    const option = SIDE_OPTIONS[event.index];
    if (option) {
      this.setSide(option.value);
    }
  }

  setSide(side: OrderSide): void {
    this.workspace.ticketSide.set(side);
  }

  onQuickSizeSelected(event: IButtonGroupEventArgs): void {
    const size = this.quickSizes()[event.index];
    if (size && !size.disabled) {
      this.setQuantity(size.quantity);
    }
  }

  setQuantity(quantity: number): void {
    this.form.controls.quantity.setValue(quantity);
  }

  /** Clicking the bid or ask pulls that price into the limit field. */
  usePrice(price: number | undefined): void {
    if (price === undefined || !this.needsLimitPrice()) {
      return;
    }

    this.form.controls.limitPrice.setValue(price);
  }

  submit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const value = this.form.getRawValue();
    const result = this.trading.submitOrder({
      symbol: this.symbol(),
      side: this.side(),
      quantity: value.quantity,
      type: value.type,
      limitPrice: this.needsLimitPrice() ? value.limitPrice : null,
      stopPrice: this.needsStopPrice() ? value.stopPrice : null,
      timeInForce: value.timeInForce,
    });

    if (!result.accepted) {
      this.rejection.set(result.reason);
      return;
    }

    const { order } = result;
    const outcome = order.status === 'Filled'
      ? `filled at ${order.fillPrice?.toFixed(2)}`
      : `working (${order.timeInForce})`;
    this.snackbar().open(`${order.id} \u00b7 ${order.side} ${order.quantity} ${order.symbol} \u2014 ${outcome}`);
  }
}

/** Enables or disables a control without firing a value change. */
function toggle(control: FormControl<number | null>, enabled: boolean): void {
  if (enabled === control.enabled) {
    return;
  }

  if (enabled) {
    control.enable({ emitEvent: false });
  } else {
    control.disable({ emitEvent: false });
  }
}
