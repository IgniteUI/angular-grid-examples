# New Financial Portfolio

Asset tracking, profit and loss analysis, featuring interactive dynamic charts.

This is a standalone Angular workspace built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). The same app also runs as the "New Financial Portfolio" tab of the samples browser at the root of this repository.

## What it shows

- A holdings grid of 50 positions, with these columns:
  - Asset: an avatar, the ticker and the company name.
  - Price Trend: a 30-point sparkline.
  - Price (Change): the change and the last price.
  - Holding Period: a short-term or long-term tag, the time held, and a bar showing the progress to the one-year line.
  - Market Value, and Total Revenue with its percentage.
  - Allocation: the share of the portfolio, with a bar scaled against the largest holding.
- A simulated market feed that re-prices 18 of the holdings every 1.2 seconds. The change chips of each re-priced holding flash in the direction of its move. The feed can be paused and resumed, and a status badge reads Live or Paused.
- A toolbar filter that keeps the rows whose ticker or company name matches and highlights every match, plus column hiding, column pinning, and export to Excel, CSV and PDF. The sparkline column is left out of the exports.
- Sorting on every column except Price Trend, light and dark appearances, and a narrow layout below 700px that keeps only Asset, Price (Change), Total Revenue and Allocation.

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:fin-new`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/finance-grid-new-app/` directory. The production build prerenders the page on the server, so the output can be served as static files.

From the repository root, `npm run build:fin-new` builds it into `dist/finance-grid-new/`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
