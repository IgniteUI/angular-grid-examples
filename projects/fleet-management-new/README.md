# New Fleet Management

A master-detail grid for managing vehicle acquisition, operations, and maintenance.

This is a standalone Angular workspace built with [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular). The same app also runs as the "New Fleet Management" tab of the samples browser at the root of this repository.

## What it shows

- A vehicle grid with sorting, column moving, and column hiding, pinning and advanced filtering from the toolbar.
- Status filter chips with live counts, and a search box that filters the rows and highlights every match.
- Row actions that move a vehicle between Active, Available and In Maintenance, each confirmed with a snackbar.
- An expandable detail per vehicle, with five tabs: the vehicle's photo and specification, trip history, maintenance, costs (doughnut and column charts) and utilization (a year-over-year column chart).
- Small, medium and large component sizes, dark and light appearances, and a reset that asks for confirmation and restores the opening state.

The vehicle photos are loaded from `https://www.infragistics.com/angular-grid-examples/cars/photos/`, using the catalog in `public/fleet-management-new/car_images.json`.

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

From the repository root, the same app runs with `npm run start:fleet-new`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/fleet-management-new-app/` directory. The production build prerenders the page on the server, so the output can be served as static files.

From the repository root, `npm run build:fleet-new` builds it into `dist/fleet-management-new/`.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
