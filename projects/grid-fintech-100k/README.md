# FinTech 100K

A 100,000-row, 41-column instrument grid with Excel-style filtering, editing, sizing and export.

This is a standalone Angular workspace built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). The same app also runs as the "FinTech 100K" tab of the samples browser at the root of this repository.

## What it shows

- A virtualized `igx-grid` of 100,000 generated instruments ("FinTech Trading", with the row count beside the title). Each row takes one of 45 seeded metal, oil, agriculture, livestock, currency, index and interest-rate instruments, a random contract, settlement, region and country, a one-off price move of up to 2% either way, and a last-update date between January and the current month. A fixed set of bond reference fields fills the remaining columns.
- 41 columns sized to their content, with the Id column hidden. Price shows an up or down arrow, and Change and Change % carry a green or red bar for the day's move.
- Sorting, Excel-style filtering (every column except the type and the reference-data columns), column moving, resizing of the Industry Sector and Issuer columns, and multiple row selection.
- Editing: Contract and Region with a drop-down of their values, Country as text, and Last Update as a date.
- The toolbar's small, medium and large size switch, a light and dark appearance toggle, column hiding ("Indicators") and pinning, and export to Excel and PDF. The PDF is A3 and keeps only the trading columns (category to sell).

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:fintech-100k`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/grid-fintech-100k-app/` directory. The production build prerenders the page on the server, so the output can be served as static files.

From the repository root, `npm run build:fintech-100k` builds it into `dist/grid-fintech-100k/`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
