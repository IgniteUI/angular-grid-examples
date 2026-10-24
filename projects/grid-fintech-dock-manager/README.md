# FinTech Dock Manager

Signal Desk: a working trading desk built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular) in a Dock Manager. Everything on screen is connected: place an order and the position, cash, P&L, blotter and alerts all move. Nothing is a static mockup.

This is a standalone Angular workspace. The same app also runs as the "FinTech Dock Manager" tab of the samples browser at the root of this repository.

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:fintech-dock`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/grid-fintech-dock-manager-app/` directory. The production build prerenders the page on the server, so the output can be served as static files. The desk itself is built in the browser: its layout, watchlist and theme come from the browser's storage, and its default arrangement is sized against the viewport.

From the repository root, `npm run build:fintech-dock` builds it into `dist/grid-fintech-dock-manager/`.

## Guided walkthrough

A five-minute tour that exercises everything worth showing. Each step is a thing to click and the thing to point at afterwards.

### 1. The desk follows one instrument

Click any row in **Watchlist**. The Order Ticket, the chart and the News filter all retarget to that symbol, and its chart comes up as a document tab. There is a single selected symbol shared across every pane.

Hover a watchlist row to reveal its row action, **remove from watchlist**. The filter box above the grid narrows the list, and **Enter** opens a chart for the first match. **Add symbol** picks any instrument of the universe; the ones already on the list are marked as added.

### 2. Place an order that actually fills

In **Order Ticket**:

1. Set the type to `Market` and press **Buy AAPL**.
2. A confirmation snackbar names the order ID and its fill price.
3. **Positions & P&L**: the AAPL quantity goes up and the average cost re-blends.
4. **Order Blotter**: a `Filled` row appears with the fill price.
5. The bell in the command bar shows an unread count; it opens the **Alerts** dialog, where the fill notification has landed.
6. The command bar's Net Liq., Day P&L and Buying Power all move.

### 3. Place an order that *doesn't* fill

Keep the type on `Limit`, set a limit price well below the market, and submit.

- The blotter shows it as **Working**, not filled.
- The command bar's **Working** count goes to 1.
- Buying Power drops: cash committed to an unfilled buy is held back.
- Now submit a limit above the market: it fills straight away. A working order whose limit the price later reaches fills on that tick: the engine re-evaluates every working order against every price update.

**Cancel all** in the blotter toolbar pulls the working orders and releases the reserved buying power.

### 4. Show that the risk checks are real

| Try this | What happens |
|---|---|
| Buy 1,000,000 shares | Rejected: *"Needs $... &mdash; buying power is $..."* |
| Sell more than you hold | Rejected: *"Only 100 AAPL shares held"* |
| Sell a symbol you don't hold | Rejected: *"No MELI position to sell &mdash; short selling is disabled"* |
| Set the type to `Limit`, clear the price and submit | Rejected: *"Limit orders require a limit price"* |
| Set TIF to `IOC` with an unreachable limit | Cancelled immediately: IOC orders don't rest |

Rejections appear inline in the ticket *and* as a blotter row, so there is an audit trail of what was refused and why.

### 5. Order types and sizing

The ticket supports `Market`, `Limit`, `Stop`, `Stop Limit` and `Trailing Stop`, each with `Day`, `GTC`, `IOC` or `FOK`. The price fields appear and disappear with the type: a `Trailing Stop` asks for a trail amount, not a stop price.

- Clicking the **Bid** or **Ask** in the price ladder pulls that price into the limit field.
- The quantity buttons are shortcuts; **Max** sizes the order to available buying power, with commission priced in so it can never be rejected for being a penny too large.
- The estimate panel breaks out notional, commission and total against remaining buying power.

### 6. Positions and flattening

**Positions & P&L** marks the book to the live market: market value, day P&L, open P&L, and each position's weight as a share of gross exposure. The summary row totals the money columns; the footer carries Open P&L, Realised P&L and exposure.

Hover a row for two actions: **add to position** (points the ticket at it) and **flatten** (sells the whole position at market). Flattening realises the P&L: watch the Realised figure in the footer move.

### 7. Charts

Chart panes are **document tabs**: they can be dragged, reordered, split side by side or closed, unlike the fixed panes. Each chart has:

- seven time ranges, from 1 Min to 5 Years;
- four series types: Candle, Line, Column and Bar;
- a Volume pane and an RSI study, each toggleable;
- a position chip showing your size, average cost and live open P&L when you hold the instrument.

The last candle updates live against the tape.

### 8. Rearranging the desk (Dock Manager)

- **Drag any pane header** to re-dock it, float it, or tab it with another pane.
- **Positions and Blotter are already tabbed** together: click between them.
- **The left rail toggles panes** on and off; the toggle state reflects the actual layout, so closing a pane by its X updates the rail too.
- **Reload the page.** The layout comes back exactly as you left it: the arrangement, the watchlist and the theme all persist.
- **Reset desk** in the rail footer restores the whole desk to its opening state, after a confirmation.

### 9. The market feed

In the command bar:

- A status badge reads **live** when the Infragistics stream hub is reachable and **simulated** when it isn't. Either way the desk animates.
- **Pause** freezes the tape: useful mid-demo when you want to talk over a screen without numbers moving.
- The speed control runs the tape at 0.5x, 1x, 2x or 5x. 5x is a good way to show the grids and chart staying smooth under load.

### 10. Alerts and news

**News** streams headlines with relative timestamps and can be filtered to one instrument. **Alerts** collects order fills, rejections, unusual moves (any instrument trading +/-2.5% against yesterday's close) and a volatility warning when the VIX crosses 20. The bell in the command bar opens them; opening them marks them read.

### 11. Theme

The sun/moon button in the command bar swaps light and dark. Every colour in the sample (grids, chart, dock manager chrome, scrollbars) resolves through palette tokens, so nothing is hard-coded per theme. The chart's own series colours follow too.

## Where the data comes from

The sample is self-contained. It opens a connection to the public Infragistics stream hub (`streamHub`) and reports **live** when that succeeds, but prices are always generated by a local simulator: the hub's payload shape doesn't match these instruments. **If the hub is unreachable the sample works identically** and just reports *simulated*, so it demos fine offline and behind a firewall. From `localhost` the hub refuses the cross-origin request, so a local run reports *simulated*, and the browser logs the refused request.

| What | Seed |
|---|---|
| Tradable universe | 24 instruments |
| Watchlist | 17 of them (add or remove any) |
| Opening book | 8 positions |
| Opening cash | $812,450 |
| Charts open on load | AAPL, TSLA, NVDA |
| News | 7 seeded headlines, then a wire item every 18 s |

Prices random-walk from the seeded values. Commission is $0.005 per share with a $1 minimum, and buying power is 2x cash (Reg-T style margin).

Layout, watchlist and theme persist to `localStorage` under `grid-fintech-dock-manager.*`. Positions, cash and orders are in memory and reset on reload: a fresh demo every time.

## Ignite UI surface covered

**Dock Manager**: split panes, tab groups, a document host, pane show and hide, programmatically added document tabs, `layoutChange` persistence, themed chrome via `--igc-*` variables.

**Grid** (three instances): templated cells, pinned columns, sorting, Excel-style filtering, advanced filtering, column moving, hiding and pinning, a toolbar with CSV, Excel and PDF export, custom summary operands, single row selection bound to shared state, action strips for row actions, and empty-state messages.

**Charts**: `igx-financial-chart` with candle, line, column and bar series, a volume pane, an RSI indicator, and incremental live updates via `notifySetItem`.

**Components**: navigation drawer, button group, simple combo, select, input group, tabs, list, chips, badge, avatar, switch, linear progress, dialog, snackbar, icon, icon button, button and action strip.

**Theming**: a two-palette Sass theme built with `palette()`, `shades()` and `adaptive-contrast()`, with component themes for the grid, navigation drawer, input group, avatar, badge, button group, chips, tabs, list, progress bar, dialog, toast, snackbar, buttons and scrollbar. Raw hex appears only in the two palette maps (and in the chart's canvas colours, which cannot read CSS variables).

## How the code is organised

```
src/app/
|-- data/market-seed.ts           Seed instruments, book, news
|-- models/stock.model.ts         Domain types
|-- services/
|   |-- market-data.service.ts    Price feed + connection state
|   |-- trading.service.ts        Order engine, positions, account
|   |-- notifications.service.ts  Alerts + news wire
|   `-- workspace.service.ts      Selected symbol, layout, theme (persisted)
|-- util/                         Formatters, pipes, dock-layout helpers, live-grid
|-- watchlist/  order-ticket/  positions-grid/  blotter/  chart-panel/  news-panel/  alerts-panel/
|-- signal-desk/                  The shell: rail, command bar, Dock Manager and dialogs
|-- _signal-desk-theme.scss       The two palettes and the component themes
|-- _desk-shared.scss             Pane primitives shared by the pane stylesheets
`-- app.component.*               The app root: the theme, and the shell (rendered in the browser only)
```

The shell owns no trading state: it wires the Dock Manager to the workspace service and mounts one component per pane. Panes never talk to each other; they share state through the four services. Standalone components, signals throughout, `OnPush` in the shell and every pane.

### Two rules worth carrying to other samples

Both apply to any Ignite UI screen showing live data.

**1. Row backgrounds in a grid must be fully opaque.** A translucent row lets what's behind it show through, and in a virtualised grid that's the recycled rows underneath, which reads as flicker on a live tape. Use `color-mix(in srgb, ...)` to tint against a solid colour rather than `hsl(... / alpha)`.

**2. Never replace a live component's data array on every tick.** A new `[data]` array makes the grid rebuild its row cache and re-measure the virtualised viewport; a new `[dataSource]` makes the chart re-bind and redraw the whole series. Both flicker once a second. Instead keep a stable array, mutate the records in place, and tell the component:

- Grid: `grid.markForCheck()`
- Financial chart: `chart.notifySetItem(source, index, oldItem, newItem)`

The array is then rebuilt only when the data genuinely changes shape: a fill adds a position, a search narrows the watchlist.

## Deliberate limitations

- **No short selling.** Sells are capped at the quantity held.
- **Prices are simulated,** not market data. Historical candles are generated from a per-symbol seed, so each chart is deterministic but not real history.
- **Fills are immediate and complete** at the bid or ask: no partial fills, no queue position, no slippage model.
- **Positions and orders reset on reload.** Only layout, watchlist and theme persist.
- **`color-mix` and relative colour syntax** require Chrome/Edge 111+, Safari 16.2+ and Firefox 113+.
- **The movers list re-ranks on every tick,** so the top five shuffle continuously.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
