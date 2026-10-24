import { IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular/core';
import { formatMoney } from '../util/finance';

/**
 * Summary operand for the positions grid's money columns. Keeping it out of the
 * component keeps the totals formatted like the rest of the desk.
 */
export class CurrencySumSummary extends IgxNumberSummaryOperand {
  override operate(data: number[] = []): IgxSummaryResult[] {
    const total = data.reduce((sum, value) => sum + value, 0);

    return [
      { key: 'total', label: 'Total', summaryResult: formatMoney(total) },
      { key: 'count', label: 'Positions', summaryResult: data.length },
    ];
  }
}
