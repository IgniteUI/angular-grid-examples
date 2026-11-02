import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { IGX_ACTION_STRIP_DIRECTIVES } from 'igniteui-angular/action-strip';
import { IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IGX_GRID_DIRECTIVES, IgxGridComponent } from 'igniteui-angular/grids/grid';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IGX_LINEAR_PROGRESS_BAR_DIRECTIVES } from 'igniteui-angular/progressbar';
import { Position } from '../models/stock.model';
import { TradingService } from '../services/trading.service';
import { WorkspaceService } from '../services/workspace.service';
import { FINANCE_PIPES } from '../util/finance.pipes';
import { refreshOnTick } from '../util/live-grid';
import { CurrencySumSummary } from './positions-summaries';

/** Row context handed to the action strip by the grid. */
interface RowContext {
  data?: Position;
}

@Component({
  selector: 'app-positions-grid',
  imports: [
    IGX_GRID_DIRECTIVES,
    IGX_ACTION_STRIP_DIRECTIVES,
    IGX_LINEAR_PROGRESS_BAR_DIRECTIVES,
    IgxIconComponent,
    IgxIconButtonDirective,
    FINANCE_PIPES,
  ],
  templateUrl: './positions-grid.html',
  styleUrl: './positions-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionsGridComponent {
  private readonly trading = inject(TradingService);
  private readonly workspace = inject(WorkspaceService);

  private readonly grid = viewChild<IgxGridComponent>('positionsGrid');

  /** Stable across ticks - rows are marked to market in place by the engine. */
  readonly positions = this.trading.positions;
  readonly account = this.trading.account;
  readonly selectedRows = computed(() => [this.workspace.selectedSymbol()]);

  /** Summary operand class handed to the money columns. */
  readonly currencySum = CurrencySumSummary;

  constructor() {
    refreshOnTick(this.grid, this.trading.marks);
  }

  selectSymbol(symbol: string | undefined): void {
    if (symbol) {
      this.workspace.selectSymbol(symbol);
    }
  }

  addTo(symbol: string | undefined): void {
    if (symbol) {
      this.workspace.prepareOrder(symbol, 'BUY');
    }
  }

  /** Sells the whole position at market - the desk's "flatten" shortcut. */
  flatten(symbol: string | undefined): void {
    if (symbol) {
      this.trading.flatten(symbol);
    }
  }

  symbolOf(context: RowContext | undefined): string | undefined {
    return context?.data?.symbol;
  }
}
