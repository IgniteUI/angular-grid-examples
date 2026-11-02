// -----------------------------------------------------------------------------
// Pure financial formatting and math helpers.
//
// Every pane formats the same handful of shapes - prices, signed deltas,
// abbreviated volumes - so the logic lives here once and is surfaced to
// templates through the pipes in `finance.pipes.ts`.
// -----------------------------------------------------------------------------

const LOCALE = 'en-US';

/** Rounds to cents. Guards the whole app against float drift in P&L sums. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** `1234.5` -> `"1,234.50"`. */
export function formatPrice(value: number, digits = 2): string {
  return value.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** `-1234.5` -> `"-1,234.50"`, `1234.5` -> `"+1,234.50"`. */
export function formatSigned(value: number, digits = 2): string {
  return `${value < 0 ? '-' : '+'}${formatPrice(Math.abs(value), digits)}`;
}

/** `-0.9` -> `"-0.90%"`. */
export function formatSignedPct(value: number, digits = 2): string {
  return `${formatSigned(value, digits)}%`;
}

/** `1234.5` -> `"$1,234.50"`. */
export function formatMoney(value: number): string {
  return `$${formatPrice(Math.abs(value))}`;
}

/** `-1234.5` -> `"-$1,234.50"`. */
export function formatSignedMoney(value: number): string {
  return `${value < 0 ? '-' : '+'}${formatMoney(value)}`;
}

const COMPACT_UNITS: readonly (readonly [threshold: number, suffix: string])[] = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
];

/** `3_440_000_000_000` -> `"3.44T"`. Used for volume and market cap. */
export function formatCompact(value: number, digits = 2): string {
  const abs = Math.abs(value);
  const unit = COMPACT_UNITS.find(([threshold]) => abs >= threshold);
  if (!unit) {
    return formatPrice(value, 0);
  }

  const [threshold, suffix] = unit;
  return `${(value / threshold).toFixed(digits)}${suffix}`;
}

/** Where `value` sits inside `[low, high]`, clamped to 0-100. */
export function rangePosition(value: number, low: number, high: number): number {
  if (high <= low) {
    return 0;
  }

  return Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
}

/** Percentage change of `value` against `base`, safe for a zero base. */
export function percentChange(value: number, base: number): number {
  return base === 0 ? 0 : ((value - base) / base) * 100;
}

/** `"14:32:07"` - the feed's market-time stamp. */
export function formatClock(at: Date): string {
  return at.toLocaleTimeString(LOCALE, { hour12: false });
}

/** `"14:32"` - compact stamp for the blotter. */
export function formatShortClock(at: Date): string {
  return at.toLocaleTimeString(LOCALE, { hour12: false, hour: '2-digit', minute: '2-digit' });
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** `"just now"`, `"14m"`, `"3h"`, `"2d"` - relative to an explicit `now`. */
export function formatSince(at: Date, now: number): string {
  const elapsed = Math.max(0, now - at.getTime());
  if (elapsed < MINUTE) {
    return 'just now';
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)}m`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)}h`;
  }
  return `${Math.floor(elapsed / DAY)}d`;
}
