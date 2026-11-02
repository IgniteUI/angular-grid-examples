import { MarketIndex, PositionLot, StockItem } from '../models/stock.model';

/**
 * Compact seed table - one tuple per instrument so the data stays readable and
 * a new symbol is a one-line change. {@link toStockItem} expands each row into
 * the full {@link StockItem} the feed publishes, deriving every field that can
 * be computed (previous close, day range, bid/ask spread) instead of repeating it.
 */
type SeedRow = readonly [
  symbol: string,
  name: string,
  sector: string,
  lastPrice: number,
  changePct: number,
  volume: number,
  avgVol3M: number,
  marketCap: number,
  week52Low: number,
  week52High: number,
];

const SEED_ROWS: readonly SeedRow[] = [
  ['AAPL',  'Apple',            'Technology',  227.14,  0.55,  8_500_000, 55_400_000, 3_440_000_000_000, 164.08,  237.49],
  ['MSFT',  'Microsoft',        'Technology',  389.79,  1.26,  4_508_000, 39_100_000, 2_897_000_000_000, 309.45,  468.35],
  ['NVDA',  'NVIDIA',           'Technology',  138.92,  2.55, 12_100_000, 246_000_000, 3_404_000_000_000, 39.23, 152.89],
  ['AMZN',  'Amazon',           'Consumer',    198.34, -0.60,  7_800_000, 37_900_000, 2_083_000_000_000, 118.35, 215.90],
  ['GOOGL', 'Alphabet',         'Technology',  178.22,  0.50,  5_100_000, 22_600_000, 2_186_000_000_000, 120.21, 191.75],
  ['META',  'Meta Platforms',   'Technology',  512.77, -0.68,  4_300_000, 12_400_000, 1_298_000_000_000, 274.38, 542.81],
  ['TSLA',  'Tesla',            'Consumer',    248.50, -0.92,  6_200_000, 82_500_000,   793_000_000_000, 138.80, 299.29],
  ['JPM',   'JPMorgan Chase',   'Financials',  204.10,  0.74,  3_900_000,  9_800_000,   586_000_000_000, 135.19, 225.48],
  ['BLK',   'BlackRock',        'Financials', 1098.58,  7.13,    334_440,    719_000,   163_000_000_000, 596.18, 1105.20],
  ['WFC',   'Wells Fargo',      'Financials',   86.49,  1.34,  2_399_000, 16_300_000,   289_000_000_000,  40.35,  88.10],
  ['C',     'Citigroup',        'Financials',  134.24,  0.73,  2_320_000, 12_700_000,   126_000_000_000,  38.17, 137.05],
  ['ADBE',  'Adobe',            'Technology',  226.98,  2.81,    560_217,  6_400_000,   100_000_000_000, 187.35, 587.75],
  ['QCOM',  'Qualcomm',         'Technology',  179.04,  0.53,    990_650, 23_100_000,   197_000_000_000, 101.47, 230.63],
  ['EQIX',  'Equinix',          'Real Estate',1024.11,  0.06,     43_869,    590_000,    98_000_000_000, 673.06, 994.79],
  ['MELI',  'MercadoLibre',     'Consumer',   1857.03, -0.90,     48_228,    540_044,    94_146_000_000, 1495.00, 2548.50],
  ['ABNB',  'Airbnb',           'Consumer',    148.56,  1.38,    287_751,  3_700_000,    93_000_000_000, 110.38, 170.10],
  ['FDX',   'FedEx',            'Industrials',  314.30,  0.21,     54_454,  2_100_000,    75_000_000_000, 199.62, 313.84],
  ['WMT',   'Walmart',          'Consumer',     113.75,  0.04,  1_376_000, 22_500_000,   913_000_000_000,  49.85, 105.30],
  ['WM',    'Waste Management', 'Industrials',  234.81,  0.22,     84_026,  2_100_000,    94_000_000_000, 154.06, 222.42],
  ['PG',    'Procter & Gamble', 'Consumer',     145.85, -0.17,    597_359,  9_100_000,   395_000_000_000, 141.45, 180.43],
  ['PFE',   'Pfizer',           'Healthcare',    24.58,  1.32,  3_284_000, 40_600_000,   139_000_000_000,  25.20,  45.35],
  ['BRK-B', 'Berkshire B',      'Financials',   489.50, -0.32,    415_865,  5_000_000, 1_056_000_000_000, 322.87, 491.67],
  ['IEMG',  'iShares EM ETF',   'ETF',           79.85,  0.16,  1_033_000, 12_400_000,    85_000_000_000,  46.51,  83.20],
  ['UNIT',  'Uniti Group',      'Real Estate',   11.03,  0.18,     79_080,  2_500_000,     2_600_000_000,   3.32,  15.98],
];

/** Half-spread applied around the last price, in basis points. */
const SPREAD_BPS = 2;
const OPENING_MARKET_TIME = '09:30:00';

function toStockItem(row: SeedRow): StockItem {
  const [symbol, name, sector, lastPrice, changePct, volume, avgVol3M, marketCap, week52Low, week52High] = row;
  const previousClose = round2(lastPrice / (1 + changePct / 100));
  const spread = round2((lastPrice * SPREAD_BPS) / 10_000);

  return {
    symbol,
    name,
    sector,
    lastPrice,
    bid: round2(lastPrice - spread),
    ask: round2(lastPrice + spread),
    previousClose,
    change: round2(lastPrice - previousClose),
    changePct,
    currency: 'USD',
    marketTime: OPENING_MARKET_TIME,
    volume,
    avgVol3M,
    dayLow: round2(Math.min(lastPrice, previousClose) * 0.994),
    dayHigh: round2(Math.max(lastPrice, previousClose) * 1.006),
    week52Low,
    week52High,
    marketCap,
    positive: changePct >= 0,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export const SEED_STOCKS: readonly StockItem[] = SEED_ROWS.map(toStockItem);

/** Every symbol the feed knows about - the universe the search box resolves against. */
export const TRADABLE_SYMBOLS: readonly string[] = SEED_STOCKS.map(s => s.symbol);

function toIndex(name: string, value: number, changePct: number): MarketIndex {
  return {
    name,
    value,
    previousClose: round2(value / (1 + changePct / 100)),
    changePct,
    positive: changePct >= 0,
  };
}

export const SEED_INDICES: readonly MarketIndex[] = [
  toIndex('S&P 500', 5634.61, 0.42),
  toIndex('NASDAQ', 18234.55, 0.65),
  toIndex('DOW', 39872.10, -0.12),
  toIndex('VIX', 14.22, -2.10),
];

/** Symbols pre-loaded into the watchlist pane. */
export const DEFAULT_WATCHLIST: readonly string[] = [
  'MELI', 'FDX', 'WMT', 'WM', 'BRK-B', 'UNIT', 'PFE', 'WFC', 'C',
  'PG', 'IEMG', 'ADBE', 'EQIX', 'QCOM', 'MSFT', 'BLK', 'ABNB',
];

/** Charts open on first load. */
export const DEFAULT_CHART_SYMBOLS: readonly string[] = ['AAPL', 'TSLA', 'NVDA'];

/** The book the desk starts the session with. */
export const OPENING_LOTS: readonly PositionLot[] = [
  { symbol: 'AAPL',  quantity: 100, avgCost: 210.40 },
  { symbol: 'TSLA',  quantity:  50, avgCost: 260.00 },
  { symbol: 'NVDA',  quantity:  30, avgCost: 120.00 },
  { symbol: 'MSFT',  quantity:  40, avgCost: 420.00 },
  { symbol: 'AMZN',  quantity:  60, avgCost: 205.00 },
  { symbol: 'GOOGL', quantity:  75, avgCost: 172.00 },
  { symbol: 'META',  quantity:  20, avgCost: 530.00 },
  { symbol: 'JPM',   quantity: 120, avgCost: 195.00 },
];

export const OPENING_CASH = 812_450;

/** Overnight wire the news pane starts with, newest first. */
export const SEED_NEWS: readonly (readonly [headline: string, source: string, symbol: string | null, minutesAgo: number])[] = [
  ['Apple beats Q3 estimates on services growth',        'Reuters',     'AAPL',  2],
  ['Fed signals possible rate cut in September',         'Bloomberg',   null,   14],
  ['Tesla deliveries miss street expectations',          'CNBC',        'TSLA',  32],
  ['Nvidia unveils next-gen AI chip architecture',       'TechWire',    'NVDA',  58],
  ['Oil prices slide on supply glut concerns',           'MarketWatch', null,   96],
  ['Microsoft Azure revenue jumps 29% year-over-year',   'WSJ',         'MSFT', 168],
  ['S&P 500 closes at a record high for a third week',   'Barron\u2019s', null, 252],
];

/** Pool the live wire draws from once the session is running. */
export const NEWS_WIRE_POOL: readonly (readonly [headline: string, source: string, symbol: string | null])[] = [
  ['Block trade crosses at a premium',              'Bloomberg',   'BLK'],
  ['Analyst lifts price target after guidance',     'Reuters',     'MSFT'],
  ['Unusual options activity flagged pre-close',    'MarketWatch', 'NVDA'],
  ['Buyback authorisation expanded',                'WSJ',         'AAPL'],
  ['Regulator opens review of proposed merger',     'Reuters',     'META'],
  ['Sector rotation lifts financials',              'CNBC',        'JPM'],
  ['Retail inflows hit a four-week high',           'Barron\u2019s', null],
  ['Treasury yields ease after auction',            'Bloomberg',   null],
  ['Supply chain checks point to stronger demand',  'TechWire',    'AMZN'],
  ['Downgrade on valuation concerns',               'CNBC',        'TSLA'],
];
