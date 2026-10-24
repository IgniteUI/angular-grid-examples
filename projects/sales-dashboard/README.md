# Sales KPI Dashboard

A sales overview dashboard: KPI cards, revenue and deals charts, revenue by region, recent activity and a leaderboard.

This is a standalone Angular workspace built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). The same app also runs as the "Sales KPI Dashboard" tab of the samples browser at the root of this repository.

## What it shows

- Four KPI cards (`igx-card`, `igx-avatar`, `igx-badge`) with the month's revenue, quota attainment, deals closed and average deal size, each with its change as a tinted pill.
- A Revenue Trend line chart of revenue against target by month, a Revenue by Region doughnut chart with its legend, and a Deals Closed This Week column chart (`igx-category-chart`, `igx-doughnut-chart`), all with custom tooltips.
- A Recent Activity grid (`igx-grid`) with a coloured pill per deal stage, and a Leaderboard list (`igx-list`) of the top reps.
- Light and dark appearances, switched from the header, and a layout that goes from four columns to two and then one as the dashboard narrows (container queries).

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:sales-dashboard`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/sales-dashboard-app/` directory. The production build prerenders the page on the server, so the output can be served as static files.

From the repository root, `npm run build:sales-dashboard` builds it into `dist/sales-dashboard/`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
