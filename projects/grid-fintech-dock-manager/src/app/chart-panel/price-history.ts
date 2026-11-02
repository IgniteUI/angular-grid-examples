/**
 * Deterministic synthetic price history.
 *
 * A sample cannot ship years of real data, so candles are generated from a seed
 * derived from the symbol: the same instrument always draws the same chart, and
 * no request or random source is involved.
 */
export interface CandlePoint {
  Date: Date;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

// Everything below is quoted per day, then scaled to the bar being drawn.
const DRIFT_PER_DAY = 0.00025;
const DAILY_NOISE = 0.03;
const MIN_VOLUME = 1_200_000;
const VOLUME_RANGE = 8_800_000;
const DAY_MS = 86_400_000;

/**
 * Floor under how far one bar may move, as a fraction of price.
 *
 * The live feed moves a stock about 0.14% a second - a tick of up to +/-0.4% on a
 * third of the universe, once a second - which is an order of magnitude more
 * than a second of the daily model above, where 3% a day scales down to 0.01%.
 * Left alone, the intraday windows draw a flat line under one live candle tall
 * enough to own the whole y-axis, and the chart reads as frozen.
 *
 * This is the feed's own per-second figure, converted from a standard deviation
 * to the full width used here (x sqrt(12)), so a one-second bar moves exactly as far
 * as the tape does in a second. It binds the second- and minute-scale windows
 * and nothing longer: an hourly bar's own scaling already clears it.
 */
const MIN_BAR_NOISE = 0.005;

/** A window to draw: how long each bar covers, and how many of them. */
export interface HistorySpec {
  /** Bar duration in milliseconds - one second up to one week. */
  readonly step: number;
  readonly bars: number;
  /** Daily bars and finer skip Saturdays and Sundays; weekly ones cannot. */
  readonly skipWeekends: boolean;
}

/**
 * Builds `spec.bars` candles of `spec.step` each, ending now and scaled to close
 * on `anchorPrice`.
 *
 * Movement is scaled off the daily figures by the square root of the step, which
 * is how volatility actually scales with time. Scaling it linearly - or not at
 * all, as this did when every bar was a day - would leave a one-second bar
 * swinging as far as a day's, and the intraday windows would read as noise
 * rather than as a price.
 */
export function buildHistory(symbol: string, anchorPrice: number, spec: HistorySpec): CandlePoint[] {
  // The step is part of the seed, so the same instrument draws a different shape
  // per window instead of the same one at seven sizes.
  const seed = seedOf(symbol) + seedOf(String(spec.step));
  const drift = DRIFT_PER_DAY * (spec.step / DAY_MS);
  const noise = noiseOf(spec);
  const candles: CandlePoint[] = [];
  let close = anchorPrice * 0.9;

  for (const time of timesOf(spec)) {
    const key = seed * 13 + candles.length * 37;
    const open = close;
    close = open * (1 + drift + (pseudoRandom(key * 5.7) - 0.5) * noise);

    candles.push(candleOf(spec, key, time, open, close));
  }

  if (candles.length === 0) {
    return [];
  }

  // Rescale so the series ends on the instrument's real opening price.
  const scale = anchorPrice / candles[candles.length - 1].Close;
  return candles.map(candle => ({
    ...candle,
    Open: round2(candle.Open * scale),
    High: round2(candle.High * scale),
    Low: round2(candle.Low * scale),
    Close: round2(candle.Close * scale),
  }));
}

/**
 * The bar that follows `previous`, closing on `price`.
 *
 * Used to roll a window forward while it is on screen: the wick and the turnover
 * come off the same model the history does, so an appended bar is not visibly a
 * different kind of bar from the ones it joins.
 */
export function nextCandle(
  previous: CandlePoint,
  spec: HistorySpec,
  price: number,
  time: number,
): CandlePoint {
  return candleOf(spec, time / spec.step, time, previous.Close, price);
}

/** One bar's wick and turnover, given its open and close. */
function candleOf(
  spec: HistorySpec,
  key: number,
  time: number,
  open: number,
  close: number,
): CandlePoint {
  // Wicks are quoted against a day's movement, so they follow the bar's own
  // move - including where that has been floored, or an intraday bar would come
  // out as a body with no wick at all.
  const wick = noiseOf(spec) / DAILY_NOISE;
  const highSpread = (0.002 + pseudoRandom(key * 1.9) * 0.018) * wick;
  const lowSpread = (0.002 + pseudoRandom(key * 2.3 + 9) * 0.018) * wick;

  return {
    Date: new Date(time),
    Open: round2(open),
    High: round2(Math.max(open, close) * (1 + highSpread)),
    Low: round2(Math.min(open, close) * (1 - lowSpread)),
    Close: round2(close),
    // Turnover is a rate, so this one scales linearly - and never to zero, which
    // is what a second of a thin day would round to.
    Volume: Math.max(
      1,
      Math.round(
        (MIN_VOLUME + pseudoRandom(key * 9.4 + 3.1) * VOLUME_RANGE) * (spec.step / DAY_MS),
      ),
    ),
  };
}

/** How far one bar of this window may move - sqrt(time) off the daily figure, floored. */
function noiseOf(spec: HistorySpec): number {
  return Math.max(DAILY_NOISE * Math.sqrt(spec.step / DAY_MS), MIN_BAR_NOISE);
}

/**
 * The bar timestamps, oldest first.
 *
 * Collected backwards from now until there are `bars` of them, so skipping a
 * weekend costs a step rather than a bar - the old version counted iterations,
 * which is why a "1Y" window of 252 day-steps only ever drew about 180 candles.
 * The cap is what stops a caller that skips weekends on a step that lands on the
 * same weekday every time from looping forever; it returns a short series
 * instead.
 */
function timesOf(spec: HistorySpec): number[] {
  const now = Date.now();
  const times: number[] = [];

  for (let step = 0; times.length < spec.bars && step < spec.bars * 4; step++) {
    const time = now - step * spec.step;
    if (spec.skipWeekends && isWeekend(new Date(time))) {
      continue;
    }

    times.push(time);
  }

  // The price path has to drift forward to today, so it is walked oldest first.
  return times.reverse();
}

const isWeekend = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;

const round2 = (value: number): number => Math.round(value * 100) / 100;

function seedOf(symbol: string): number {
  return [...symbol].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

/** Sine-based hash - a stable stand-in for `Math.random` with a seed. */
function pseudoRandom(value: number): number {
  const x = Math.sin(value) * 10_000;
  return x - Math.floor(x);
}
