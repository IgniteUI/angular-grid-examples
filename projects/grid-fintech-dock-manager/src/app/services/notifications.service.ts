import { Injectable, NgZone, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { NEWS_WIRE_POOL, SEED_NEWS } from '../data/market-seed';
import { DeskNotification, NewsArticle, NotificationTone } from '../models/stock.model';
import { formatSignedPct } from '../util/finance';
import { MarketDataService } from './market-data.service';

/** Intraday move that raises an "unusual move" alert, in percent. */
const UNUSUAL_MOVE_PCT = 2.5;
/** VIX level above which the desk gets a risk warning. */
const VIX_RISK_LEVEL = 20;
/** Minimum gap between two alerts about the same subject. */
const ALERT_COOLDOWN_MS = 45_000;
const NEWS_INTERVAL_MS = 18_000;
const CLOCK_INTERVAL_MS = 15_000;
const MAX_NOTIFICATIONS = 40;
const MAX_NEWS = 40;

/**
 * The desk's alert and news feed. Fills are pushed in by the trading engine;
 * price alerts are derived here by watching the market feed.
 *
 * The wire and clock timers run outside the Angular zone for the same reason
 * the tape does (see `MarketDataService`): they live for the whole session.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  private readonly market = inject(MarketDataService);
  private readonly zone = inject(NgZone);

  private readonly _notifications = signal<DeskNotification[]>([]);
  private readonly _news = signal<NewsArticle[]>(seedNews());

  readonly notifications = this._notifications.asReadonly();
  readonly news = this._news.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(item => !item.read).length);

  /**
   * Coarse clock driving relative timestamps. Exposed as a signal so the
   * `since` pipe can stay pure: `{{ item.at | since: now() }}`.
   */
  readonly now = signal(Date.now());

  private readonly lastAlertAt = new Map<string, number>();
  private readonly timers: ReturnType<typeof setInterval>[] = [];
  private sequence = 0;
  private newsCursor = 0;

  constructor() {
    effect(() => {
      this.market.tick();
      untracked(() => this.scanForAlerts(this.market.stocks, this.market.indices()));
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start(): void {
    if (this.timers.length > 0) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.timers.push(
        setInterval(() => this.publishWireItem(), NEWS_INTERVAL_MS),
        setInterval(() => this.now.set(Date.now()), CLOCK_INTERVAL_MS),
      );
    });
  }

  stop(): void {
    this.timers.splice(0).forEach(clearInterval);
  }

  push(notification: Omit<DeskNotification, 'id' | 'at' | 'read'>): void {
    const entry: DeskNotification = {
      ...notification,
      id: `n${++this.sequence}`,
      at: new Date(),
      read: false,
    };

    this._notifications.update(current => [entry, ...current].slice(0, MAX_NOTIFICATIONS));
    this.now.set(Date.now());
  }

  markAllRead(): void {
    this._notifications.update(current => current.map(item => (item.read ? item : { ...item, read: true })));
  }

  /** Drops every alert and puts the wire back to the seeded stories. */
  reset(): void {
    this._notifications.set([]);
    this._news.set(seedNews());
    // Cooldowns are per-session state too, or the first post-reset alert for a
    // subject the desk had already warned about would be swallowed.
    this.lastAlertAt.clear();
    this.sequence = 0;
    this.newsCursor = 0;
    this.now.set(Date.now());
  }

  clear(): void {
    this._notifications.set([]);
  }

  /** News for one instrument plus the untagged macro wire. */
  newsFor(symbol: string): NewsArticle[] {
    return this._news().filter(article => article.symbol === null || article.symbol === symbol);
  }

  // -- Derived alerts --------------------------------------------------------

  private scanForAlerts(quotes: readonly { symbol: string; changePct: number }[], indices: readonly { name: string; value: number }[]): void {
    for (const quote of quotes) {
      if (Math.abs(quote.changePct) < UNUSUAL_MOVE_PCT) {
        continue;
      }

      const gaining = quote.changePct > 0;
      this.pushThrottled(`move:${quote.symbol}`, {
        title: `${quote.symbol} unusual move`,
        detail: `Trading ${formatSignedPct(quote.changePct)} against yesterday's close`,
        icon: gaining ? 'trending_up' : 'trending_down',
        tone: gaining ? 'success' : 'error',
      });
    }

    const vix = indices.find(index => index.name === 'VIX');
    if (vix && vix.value >= VIX_RISK_LEVEL) {
      this.pushThrottled('risk:vix', {
        title: 'Volatility warning',
        detail: `VIX at ${vix.value.toFixed(2)} \u2014 review position sizing`,
        icon: 'warning',
        tone: 'warn',
      });
    }
  }

  private pushThrottled(key: string, notification: { title: string; detail: string; icon: string; tone: NotificationTone }): void {
    const now = Date.now();
    if (now - (this.lastAlertAt.get(key) ?? 0) < ALERT_COOLDOWN_MS) {
      return;
    }

    this.lastAlertAt.set(key, now);
    this.push(notification);
  }

  private publishWireItem(): void {
    const [headline, source, symbol] = NEWS_WIRE_POOL[this.newsCursor % NEWS_WIRE_POOL.length];
    this.newsCursor++;

    const article: NewsArticle = {
      id: `w${this.newsCursor}`,
      headline,
      source,
      symbol,
      at: new Date(),
    };

    this._news.update(current => [article, ...current].slice(0, MAX_NEWS));
    this.now.set(Date.now());
  }
}

function seedNews(): NewsArticle[] {
  const now = Date.now();
  return SEED_NEWS.map(([headline, source, symbol, minutesAgo], index) => ({
    id: `s${index}`,
    headline,
    source,
    symbol,
    at: new Date(now - minutesAgo * 60_000),
  }));
}
