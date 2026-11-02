import { Pipe, PipeTransform } from '@angular/core';
import {
  formatCompact,
  formatMoney,
  formatPrice,
  formatShortClock,
  formatSigned,
  formatSignedMoney,
  formatSignedPct,
  formatSince,
} from './finance';

/** `plain` -> `+1.23`, `pct` -> `+1.23%`, `money` -> `+$1.23`. */
export type SignedFormat = 'plain' | 'pct' | 'money';

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    return value == null ? '\u2014' : formatPrice(value, digits);
  }
}

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value == null ? '\u2014' : formatMoney(value);
  }
}

@Pipe({ name: 'signed' })
export class SignedPipe implements PipeTransform {
  transform(value: number | null | undefined, format: SignedFormat = 'plain'): string {
    if (value == null) {
      return '\u2014';
    }

    switch (format) {
      case 'pct':
        return formatSignedPct(value);
      case 'money':
        return formatSignedMoney(value);
      default:
        return formatSigned(value);
    }
  }
}

@Pipe({ name: 'compact' })
export class CompactPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    return value == null ? '\u2014' : formatCompact(value, digits);
  }
}

@Pipe({ name: 'shortClock' })
export class ShortClockPipe implements PipeTransform {
  transform(value: Date | null | undefined): string {
    return value ? formatShortClock(value) : '\u2014';
  }
}

/**
 * Relative timestamp. `now` is passed in from a ticking signal so the pipe
 * stays pure and still re-renders as time passes:
 * `{{ item.at | since: now() }}`.
 */
@Pipe({ name: 'since' })
export class SincePipe implements PipeTransform {
  transform(value: Date | null | undefined, now: number): string {
    return value ? formatSince(value, now) : '\u2014';
  }
}

/** Import surface for templates: `imports: [FINANCE_PIPES]`. */
export const FINANCE_PIPES = [
  PricePipe,
  MoneyPipe,
  SignedPipe,
  CompactPipe,
  ShortClockPipe,
  SincePipe,
] as const;
