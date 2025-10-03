import { Routes } from '@angular/router';
import { SalesViewComponent } from './views/sales/sales-view.component';
import { HrPortalViewComponent } from './views/hr-portal/hr-portal-view.component';
import { FinanceViewComponent } from './views/finance/finance-view.component';
import { ErpHGridViewComponent } from './views/erp-hgrid/erp-hgrid-view.component';
import { FleetManagementViewComponent } from './views/fleet-management/fleet-management-view.component';
import { HomeComponent } from './views/home/home.component';
import { ColumnChartViewComponent } from './views/charts/column-chart/column-chart-view.component';
import { BarChartViewComponent } from './views/charts/bar-chart/bar-chart-view.component';
import { LineChartViewComponent } from './views/charts/line-chart/line-chart-view.component';
import { PieChartViewComponent } from './views/charts/pie-chart/pie-chart-view.component';
import { PolarChartViewComponent } from './views/charts/polar-chart/polar-chart-view.component';
import { StepChartViewComponent } from './views/charts/step-chart/step-chart-view.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    title: "home",
    component: HomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inventory'
      },
      {
        path: 'inventory',
        title: "Inventory",
        component: ErpHGridViewComponent
      },
      {
        path: 'hr-portal',
        title: "HR Portal",
        component: HrPortalViewComponent
      },
      {
        path: 'finance',
        title: "Finance",
        component: FinanceViewComponent
      },
      {
        path: 'sales',
        title: "Sales",
        component: SalesViewComponent
      },
      {
        path: 'fleet',
        title: "Fleet Management",
        component: FleetManagementViewComponent
      },
      {
        path: 'charts',
        children: [
          {
            path: 'column-chart',
            title: 'Column Chart',
            component: ColumnChartViewComponent
          },
          {
            path: 'bar-chart',
            title: 'Bar Chart',
            component: BarChartViewComponent
          },
          {
            path: 'line-chart',
            title: 'Line Chart',
            component: LineChartViewComponent
          },
          {
            path: 'pie-chart',
            title: 'Pie Chart',
            component: PieChartViewComponent
          },
          {
            path: 'step-chart',
            title: 'Step Chart',
            component: StepChartViewComponent
          },
          {
            path: 'polar-chart',
            title: 'Polar Chart',
            component: PolarChartViewComponent
          },
          {
            path: '',
            redirectTo: 'column-chart',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },
  {
    path: 'inventory',
    title: "Inventory",
    component: ErpHGridViewComponent
  },
  {
    path: 'hr-portal',
    title: "HR Portal",
    component: HrPortalViewComponent
  },
  {
    path: 'finance',
    title: "Finance",
    component: FinanceViewComponent
  },
  {
    path: 'sales',
    title: "Sales",
    component: SalesViewComponent
  },
  {
    path: 'fleet',
    title: "Fleet Management",
    component: FleetManagementViewComponent
  },
  {
    path: 'charts',
    title: 'charts',
    children: [
      {
        path: 'column-chart',
        title: 'Column Chart',
        component: ColumnChartViewComponent
      },
      {
        path: 'bar-chart',
        title: 'Bar Chart',
        component: BarChartViewComponent
      },
      {
        path: 'line-chart',
        title: 'Line Chart',
        component: LineChartViewComponent
      },
      {
        path: 'pie-chart',
        title: 'Pie Chart',
        component: PieChartViewComponent
      },
      {
        path: 'step-chart',
        title: 'Step Chart',
        component: StepChartViewComponent
      },
      {
        path: 'polar-chart',
        title: 'Polar Chart',
        component: PolarChartViewComponent
      },
      {
        path: '',
        redirectTo: 'column-chart',
        pathMatch: 'full'
      }
    ]
  }
];
