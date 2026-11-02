# Budget Planning Workbook

A retail budget planning workbook in the Spreadsheet, with formulas, filterable tables and charts.

This is a standalone Angular workspace built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). The same app also runs as the "Budget Planning Workbook" tab of the samples browser at the root of this repository.

## What it shows

- The FY2027 budget workbook of a fictional retailer, Meridian North Retail Co., loaded into the Ignite UI for Angular Spreadsheet (`igx-spreadsheet`) from `public/excel/meridian-north-retail-fy2027-budget.xlsx` with the Excel library's `Workbook.load()`.
- Eight worksheets: Revenue Detail, Expense Detail, Variance Report, Cash Flow Forecast, Headcount Plan, Dashboard, Assumptions and a Budget Request Form.
- Live formulas that recalculate as cells are edited, conditional formatting, data validation (number rules and drop-down lists) and frozen header rows.
- Filterable tables (revenue, expenses and headcount) whose header columns are widened after load, so the AutoFilter buttons do not cover the labels.
- Excel charts (the cash balance forecast, budget against actual revenue, and expenses by department), rendered through the Spreadsheet chart adapter.
- The workbook fills the whole page, and the Spreadsheet follows the page as it is resized.

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:excel`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/excel-app/` directory. The production build prerenders the page on the server, so the output can be served as static files. The Spreadsheet itself is built in the browser.

From the repository root, `npm run build:excel` builds it into `dist/excel/`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
