import { Injectable } from '@angular/core';

export type FinanceTone = 'blue' | 'orange' | 'green' | 'slate' | 'gold' | 'red';

export interface PriceTrendPoint {
  value: number;
}

export interface FinanceSeedRow {
  ticker: string;
  company: string;
  lastPrice: number;
  changePct: number;
  marketValue: number;
  netProfit: number;
  netProfitPct: number;
  allocationPct: number;
  averageCost: number;
  position: number;
  holdingPeriodDays: number;
  tone: FinanceTone;
}

export interface FinanceRow extends FinanceSeedRow {
  priceTrend: PriceTrendPoint[];
}

@Injectable({ providedIn: 'root' })
export class FinanceDataService {
  private readonly seedRows: FinanceSeedRow[] = [
    { ticker: 'AMD', company: 'Advanced Micro Devices Inc.', lastPrice: 130.36, changePct: 0, marketValue: 3128.64, netProfit: 1315.68, netProfitPct: 72.57, allocationPct: 4.38, averageCost: 75.54, position: 24, holdingPeriodDays: 157, tone: 'blue' },
    { ticker: 'ETH', company: 'Ethereum', lastPrice: 3567.93, changePct: -0.2, marketValue: 10073.79, netProfit: 3074.79, netProfitPct: 40.3, allocationPct: 18.43, averageCost: 2543, position: 3, holdingPeriodDays: 120, tone: 'slate' },
    { ticker: 'ABNB', company: 'Airbnb Inc.', lastPrice: 130.65, changePct: -0.77, marketValue: 3004.95, netProfit: 1709.59, netProfitPct: 131.98, allocationPct: 3.13, averageCost: 56.32, position: 23, holdingPeriodDays: 540, tone: 'red' },
    { ticker: 'BABA', company: 'Alibaba Group Holding Limited', lastPrice: 81.81, changePct: 1.22, marketValue: 981.72, netProfit: -310.92, netProfitPct: -24.05, allocationPct: 3.12, averageCost: 107.72, position: 12, holdingPeriodDays: 91, tone: 'orange' },
    { ticker: 'BTC', company: 'Bitcoin', lastPrice: 95300.86, changePct: 0.72, marketValue: 19060.17, netProfit: 7013.97, netProfitPct: 58.23, allocationPct: 29.1, averageCost: 60231, position: 0.2, holdingPeriodDays: 323, tone: 'gold' },
    { ticker: 'BKNG', company: 'Booking Holdings Inc', lastPrice: 4932.51, changePct: 1.03, marketValue: 986.5, netProfit: 110.86, netProfitPct: 12.66, allocationPct: 2.12, averageCost: 4378.21, position: 0.2, holdingPeriodDays: 17, tone: 'blue' },
    { ticker: 'COST', company: 'Costco Wholesale Corporation', lastPrice: 911.37, changePct: -0.33, marketValue: 9113.7, netProfit: 212.5, netProfitPct: 2.39, allocationPct: 21.5, averageCost: 890.12, position: 10, holdingPeriodDays: 32, tone: 'red' },
    { ticker: 'DPZ', company: 'Dominos Pizza Inc', lastPrice: 19.5, changePct: 0, marketValue: 409.5, netProfit: -96.6, netProfitPct: -19.09, allocationPct: 1.22, averageCost: 24.1, position: 21, holdingPeriodDays: 54, tone: 'red' },
    { ticker: 'FDX', company: 'FedEx Corporation', lastPrice: 286.96, changePct: 0.35, marketValue: 573.92, netProfit: 35.82, netProfitPct: 6.66, allocationPct: 1.3, averageCost: 269.05, position: 2, holdingPeriodDays: 72, tone: 'orange' },
    { ticker: 'F', company: 'Ford Motor Company', lastPrice: 10.41, changePct: 0, marketValue: 58.3, netProfit: -26.88, netProfitPct: -31.56, allocationPct: 0.21, averageCost: 15.21, position: 5.6, holdingPeriodDays: 431, tone: 'blue' },
    { ticker: 'GM', company: 'General Motors Company', lastPrice: 53.25, changePct: 0, marketValue: 165.08, netProfit: 65.07, netProfitPct: 65.07, allocationPct: 0.24, averageCost: 32.26, position: 3.1, holdingPeriodDays: 652, tone: 'blue' },
    { ticker: 'AAPL', company: 'Apple Inc.', lastPrice: 223.36, changePct: 0.45, marketValue: 245.7, netProfit: 76.07, netProfitPct: 44.84, allocationPct: 0.41, averageCost: 154.21, position: 1.1, holdingPeriodDays: 632, tone: 'slate' },
    { ticker: 'MSFT', company: 'Microsoft Corp.', lastPrice: 401.22, changePct: 0.5, marketValue: 280.85, netProfit: -20.15, netProfitPct: -6.69, allocationPct: 0.73, averageCost: 430, position: 0.7, holdingPeriodDays: 342, tone: 'blue' },
    { ticker: 'GOOGL', company: 'Alphabet Inc.', lastPrice: 160.02, changePct: 1.25, marketValue: 208.03, netProfit: -18.17, netProfitPct: -8.03, allocationPct: 0.55, averageCost: 174, position: 1.3, holdingPeriodDays: 376, tone: 'green' },
    { ticker: 'AMZN', company: 'Amazon.com Inc.', lastPrice: 205.87, changePct: 0.49, marketValue: 885.24, netProfit: -285.82, netProfitPct: -24.41, allocationPct: 2.83, averageCost: 272.34, position: 4.3, holdingPeriodDays: 352, tone: 'gold' },
    { ticker: 'JPM', company: 'JPMorgan Chase and Co', lastPrice: 238.84, changePct: -0.42, marketValue: 71.65, netProfit: 1.42, netProfitPct: 2.02, allocationPct: 0.17, averageCost: 234.11, position: 0.3, holdingPeriodDays: 13, tone: 'blue' },
    { ticker: 'TSLA', company: 'Tesla Inc.', lastPrice: 332.92, changePct: 0.9, marketValue: 1598.02, netProfit: 157.01, netProfitPct: 10.9, allocationPct: 3.48, averageCost: 300.21, position: 4.8, holdingPeriodDays: 452, tone: 'red' },
    { ticker: 'NVDA', company: 'NVIDIA Corp.', lastPrice: 136.92, changePct: 0, marketValue: 164.3, netProfit: 44.3, netProfitPct: 36.92, allocationPct: 0.29, averageCost: 100, position: 1.2, holdingPeriodDays: 237, tone: 'green' },
    { ticker: 'K', company: 'Kellogg Company', lastPrice: 76.66, changePct: 0, marketValue: 15.33, netProfit: -0.31, netProfitPct: -1.98, allocationPct: 0.04, averageCost: 78.23, position: 0.2, holdingPeriodDays: 2, tone: 'red' },
    { ticker: 'V', company: 'Visa Inc.', lastPrice: 307.92, changePct: 0.65, marketValue: 24.63, netProfit: -2.37, netProfitPct: -8.78, allocationPct: 0.07, averageCost: 337.6, position: 0.08, holdingPeriodDays: 365, tone: 'blue' },
    { ticker: 'JNJ', company: 'Johnson & Johnson', lastPrice: 155.77, changePct: -0.64, marketValue: 327.12, netProfit: -33.41, netProfitPct: -9.27, allocationPct: 0.87, averageCost: 171.68, position: 2.1, holdingPeriodDays: 420, tone: 'red' },
    { ticker: 'PG', company: 'Procter & Gamble Co.', lastPrice: 156.89, changePct: 0, marketValue: 141.2, netProfit: -9.01, netProfitPct: -6, allocationPct: 0.36, averageCost: 166.9, position: 0.9, holdingPeriodDays: 150, tone: 'slate' },
    { ticker: 'WMT', company: 'Walmart Inc.', lastPrice: 145.65, changePct: -1.37, marketValue: 52.43, netProfit: 9.23, netProfitPct: 21.37, allocationPct: 0.1, averageCost: 120, position: 0.36, holdingPeriodDays: 250, tone: 'blue' },
    { ticker: 'HD', company: 'The Home Depot Inc.', lastPrice: 428.61, changePct: -1.4, marketValue: 145.73, netProfit: -7.72, netProfitPct: -5.03, allocationPct: 0.37, averageCost: 451.31, position: 0.34, holdingPeriodDays: 290, tone: 'orange' },
    { ticker: 'KO', company: 'Coca-Cola Co.', lastPrice: 56.79, changePct: 0, marketValue: 22.72, netProfit: -11.87, netProfitPct: -34.32, allocationPct: 0.08, averageCost: 86.46, position: 0.4, holdingPeriodDays: 180, tone: 'red' },
    { ticker: 'PEP', company: 'PepsiCo Inc.', lastPrice: 184.37, changePct: -1.08, marketValue: 36.87, netProfit: -1.16, netProfitPct: -3.05, allocationPct: 0.09, averageCost: 190.15, position: 0.2, holdingPeriodDays: 430, tone: 'slate' },
    { ticker: 'DIS', company: 'Walt Disney Co.', lastPrice: 178, changePct: 0.56, marketValue: 33.82, netProfit: -8.47, netProfitPct: -20.03, allocationPct: 0.1, averageCost: 222.56, position: 0.19, holdingPeriodDays: 380, tone: 'red' },
    { ticker: 'PFE', company: 'Pfizer Inc.', lastPrice: 39.81, changePct: 0, marketValue: 3.98, netProfit: -0.15, netProfitPct: -3.63, allocationPct: 0.01, averageCost: 41.32, position: 0.1, holdingPeriodDays: 180, tone: 'blue' },
    { ticker: 'XOM', company: 'Exxon Mobil Corp.', lastPrice: 114.38, changePct: 1.75, marketValue: 388.89, netProfit: -100.06, netProfitPct: -20.46, allocationPct: 1.18, averageCost: 143.81, position: 3.4, holdingPeriodDays: 400, tone: 'red' },
    { ticker: 'CVX', company: 'Chevron Corp.', lastPrice: 179.62, changePct: -0.56, marketValue: 71.85, netProfit: 11.12, netProfitPct: 18.31, allocationPct: 0.15, averageCost: 151.82, position: 0.4, holdingPeriodDays: 320, tone: 'blue' },
    { ticker: 'MCD', company: 'McDonalds Corporation', lastPrice: 281.27, changePct: 0.61, marketValue: 87.19, netProfit: 74.62, netProfitPct: 132.06, allocationPct: 0.17, averageCost: 121.21, position: 0.31, holdingPeriodDays: 610, tone: 'gold' },
    { ticker: 'INTC', company: 'Intel Corp.', lastPrice: 23.65, changePct: 0, marketValue: 6.39, netProfit: -16.56, netProfitPct: -72.18, allocationPct: 0.01, averageCost: 85, position: 0.27, holdingPeriodDays: 342, tone: 'green' },
    { ticker: 'NFLX', company: 'Netflix Inc.', lastPrice: 877.34, changePct: 0, marketValue: 105.28, netProfit: 99.88, netProfitPct: 1849.64, allocationPct: 0.19, averageCost: 45, position: 0.12, holdingPeriodDays: 289, tone: 'blue' },
    { ticker: 'ADBE', company: 'Adobe Inc.', lastPrice: 513.68, changePct: 0, marketValue: 174.65, netProfit: 148.13, netProfitPct: 558.56, allocationPct: 0.32, averageCost: 78, position: 0.34, holdingPeriodDays: 412, tone: 'gold' },
    { ticker: 'CRM', company: 'Salesforce Inc.', lastPrice: 341.45, changePct: 0, marketValue: 307.31, netProfit: 256.9, netProfitPct: 509.73, allocationPct: 0.56, averageCost: 56, position: 0.9, holdingPeriodDays: 198, tone: 'gold' },
    { ticker: 'BA', company: 'Boeing Co', lastPrice: 152.4, changePct: 0, marketValue: 71.63, netProfit: 28.39, netProfitPct: 65.65, allocationPct: 0.13, averageCost: 92, position: 0.47, holdingPeriodDays: 276, tone: 'red' },
    { ticker: 'IBM', company: 'IBM Corp.', lastPrice: 222.97, changePct: 0, marketValue: 66.89, netProfit: 53.39, netProfitPct: 395.49, allocationPct: 0.12, averageCost: 45, position: 0.3, holdingPeriodDays: 365, tone: 'blue' },
    { ticker: 'MDLZ', company: 'Mondelez International Inc', lastPrice: 64.4, changePct: 0, marketValue: 61.18, netProfit: -47.5, netProfitPct: -43.71, allocationPct: 0.11, averageCost: 114.4, position: 0.95, holdingPeriodDays: 2, tone: 'red' },
    { ticker: 'MS', company: 'Morgan Stanley', lastPrice: 131.2, changePct: 0, marketValue: 87.9, netProfit: -33.5, netProfitPct: -27.59, allocationPct: 0.16, averageCost: 181.2, position: 0.67, holdingPeriodDays: 13, tone: 'gold' },
    { ticker: 'SPOT', company: 'Spotify Technology SA', lastPrice: 475.87, changePct: 0, marketValue: 166.55, netProfit: -17.5, netProfitPct: -9.51, allocationPct: 0.3, averageCost: 525.87, position: 0.35, holdingPeriodDays: 41, tone: 'green' },
    { ticker: 'MMM', company: '3M Co.', lastPrice: 130.32, changePct: 0, marketValue: 195.48, netProfit: -30, netProfitPct: -13.3, allocationPct: 0.36, averageCost: 150.32, position: 1.5, holdingPeriodDays: 123, tone: 'slate' },
    { ticker: 'CSCO', company: 'Cisco Systems Inc.', lastPrice: 58.74, changePct: 0, marketValue: 28.2, netProfit: -19.2, netProfitPct: -40.51, allocationPct: 0.05, averageCost: 98.74, position: 0.48, holdingPeriodDays: 456, tone: 'green' },
    { ticker: 'SBUX', company: 'Starbucks Corp.', lastPrice: 101.51, changePct: 0, marketValue: 22.33, netProfit: -8.8, netProfitPct: -28.27, allocationPct: 0.04, averageCost: 141.51, position: 0.22, holdingPeriodDays: 234, tone: 'gold' },
    { ticker: 'AXP', company: 'American Express Co.', lastPrice: 304.28, changePct: 0, marketValue: 100.41, netProfit: -13.2, netProfitPct: -11.62, allocationPct: 0.18, averageCost: 344.28, position: 0.33, holdingPeriodDays: 389, tone: 'red' },
    { ticker: 'GE', company: 'General Electric Co.', lastPrice: 181.15, changePct: 0, marketValue: 126.8, netProfit: -28, netProfitPct: -18.09, allocationPct: 0.23, averageCost: 221.15, position: 0.7, holdingPeriodDays: 178, tone: 'green' },
    { ticker: 'UBER', company: 'Uber Technologies Inc', lastPrice: 71.51, changePct: 0, marketValue: 16.45, netProfit: 3.45, netProfitPct: 26.54, allocationPct: 0.03, averageCost: 56.51, position: 0.23, holdingPeriodDays: 487, tone: 'green' },
    { ticker: 'ZM', company: 'Zoom Video Communications Inc', lastPrice: 89.03, changePct: 0, marketValue: 9.79, netProfit: 3.85, netProfitPct: 64.78, allocationPct: 0.02, averageCost: 54.03, position: 0.11, holdingPeriodDays: 276, tone: 'red' },
    { ticker: 'CAT', company: 'Caterpillar Inc.', lastPrice: 406.35, changePct: 0, marketValue: 77.21, netProfit: -7.6, netProfitPct: -8.96, allocationPct: 0.14, averageCost: 446.35, position: 0.19, holdingPeriodDays: 87, tone: 'blue' },
    { ticker: 'HON', company: 'Honeywell International Inc.', lastPrice: 229.64, changePct: 0, marketValue: 50.52, netProfit: -8.8, netProfitPct: -14.83, allocationPct: 0.09, averageCost: 269.64, position: 0.22, holdingPeriodDays: 276, tone: 'orange' },
    { ticker: 'PYPL', company: 'PayPal Holdings Inc.', lastPrice: 86.57, changePct: 0, marketValue: 32.03, netProfit: -14.8, netProfitPct: -31.6, allocationPct: 0.06, averageCost: 126.57, position: 0.37, holdingPeriodDays: 412, tone: 'orange' }
  ];

  /** Seed rows enriched with a deterministic, per-ticker synthetic price trend. */
  public readonly financeRows: FinanceRow[] = this.seedRows.map((row) => ({ ...row, priceTrend: this.buildPriceTrend(row.ticker, row.changePct) }));
  public readonly maxAllocationPct = Math.max(...this.financeRows.map((row) => Math.abs(row.allocationPct)), 0);

  private buildPriceTrend(ticker: string, changePct: number): PriceTrendPoint[] {
    const points = 30;
    const target = Number(changePct.toFixed(2));
    const volatility = Math.max(0.2, Math.min(1.15, Math.abs(changePct) * 0.55 + 0.25));
    const hashSeed = ticker.split('').reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 2166136261);
    let seed = hashSeed;
    let value = 0;
    const series: PriceTrendPoint[] = [];

    const nextRandom = (): number => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };

    for (let index = 0; index < points; index++) {
      const t = index / (points - 1);
      const directionalTarget = target * t;
      const randomStep = (nextRandom() - 0.5) * volatility;
      const pull = (directionalTarget - value) * 0.22;
      const microWave = Math.sin((t * Math.PI * 9) + (hashSeed % 11)) * 0.06;
      value += randomStep + pull + microWave;
      series.push({ value: Number(value.toFixed(2)) });
    }

    if (series.length > 0) {
      series[series.length - 1] = { value: target };
    }

    return series;
  }
}
