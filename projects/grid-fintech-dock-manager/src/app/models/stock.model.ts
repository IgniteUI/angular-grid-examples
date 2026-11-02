// -----------------------------------------------------------------------------
// Domain model for the Signal Desk sample.
//
// These types are the contract between the three services (market feed,
// trading engine, notifications) and every pane that renders their state.
// -----------------------------------------------------------------------------

/** A single instrument as published by the market feed. */
export interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  /** Last traded price. */
  lastPrice: number;
  /** Best bid / ask around the last price. */
  bid: number;
  ask: number;
  /** Yesterday's settlement - the anchor for every "day change" figure. */
  previousClose: number;
  /** `lastPrice - previousClose`, kept denormalised for grid sorting. */
  change: number;
  changePct: number;
  currency: string;
  marketTime: string;
  volume: number;
  avgVol3M: number;
  dayLow: number;
  dayHigh: number;
  week52Low: number;
  week52High: number;
  marketCap: number;
  positive: boolean;
}

/** A headline index shown in the command-bar ribbon. */
export interface MarketIndex {
  name: string;
  value: number;
  /** Yesterday's close, so `changePct` is always derivable rather than drifting. */
  previousClose: number;
  changePct: number;
  positive: boolean;
}

export type OrderSide = 'BUY' | 'SELL';

export const ORDER_TYPES = ['Market', 'Limit', 'Stop', 'Stop Limit', 'Trailing Stop'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const TIME_IN_FORCE = ['Day', 'GTC', 'IOC', 'FOK'] as const;
export type TimeInForce = (typeof TIME_IN_FORCE)[number];

export type OrderStatus = 'Working' | 'Filled' | 'Cancelled' | 'Rejected';

/** What the order ticket hands to the trading engine. */
export interface OrderDraft {
  symbol: string;
  side: OrderSide;
  quantity: number;
  type: OrderType;
  /** Required for Limit and Stop Limit. */
  limitPrice: number | null;
  /** Required for Stop, Stop Limit and Trailing Stop (as an offset). */
  stopPrice: number | null;
  timeInForce: TimeInForce;
}

/** A draft accepted by the engine, with its lifecycle state. */
export interface Order extends OrderDraft {
  id: string;
  status: OrderStatus;
  placedAt: Date;
  /** Populated once the order leaves `Working`. */
  filledAt: Date | null;
  fillPrice: number | null;
  /** Rejection reason, or the trigger that filled the order. */
  note: string;
  /** Best price seen since submission - drives the trailing stop. */
  peakPrice: number | null;
}

/** The engine's book: one aggregated lot per symbol. */
export interface PositionLot {
  symbol: string;
  quantity: number;
  avgCost: number;
}

/** A lot marked to the live market - everything the positions grid renders. */
export interface Position extends PositionLot {
  name: string;
  last: number;
  previousClose: number;
  marketValue: number;
  dayChange: number;
  dayChangePct: number;
  openPl: number;
  openPlPct: number;
  /** Share of gross market value, 0-100. */
  weight: number;
}

/** Aggregated account state for the command bar and positions footer. */
export interface AccountSummary {
  cash: number;
  marketValue: number;
  netLiquidation: number;
  openPl: number;
  dayPl: number;
  realizedPl: number;
  buyingPower: number;
  /** Gross exposure as a share of net liquidation, 0-100. */
  utilisation: number;
}

export type NotificationTone = 'success' | 'warn' | 'error' | 'info';

/** A desk notification - order fills, price alerts and risk warnings. */
export interface DeskNotification {
  id: string;
  title: string;
  detail: string;
  icon: string;
  tone: NotificationTone;
  at: Date;
  read: boolean;
}

/** A news wire item; `symbol` ties it to an instrument when relevant. */
export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  symbol: string | null;
  at: Date;
}
