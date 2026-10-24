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

// These samples bring large libraries (spreadsheet, dock manager, live market feeds), so each one is
// loaded on demand in its own chunk instead of growing the main bundle that every tab downloads.
const loadFinanceGridNew = () => import('./views/finance-grid-new/finance-grid-new-view.component').then((m) => m.FinanceGridNewViewComponent);
const loadGridFintech100k = () => import('./views/grid-fintech-100k/grid-fintech-100k-view.component').then((m) => m.GridFintech100kViewComponent);
const loadSalesDashboard = () => import('./views/sales-dashboard/sales-dashboard-view.component').then((m) => m.SalesDashboardViewComponent);
const loadFleetManagementNew = () => import('./views/fleet-management-new/fleet-management-new-view.component').then((m) => m.FleetManagementNewViewComponent);
const loadGridFintechDockManager = () => import('./views/grid-fintech-dock-manager/grid-fintech-dock-manager-view.component').then((m) => m.GridFintechDockManagerViewComponent);
const loadExcel = () => import('./views/excel/excel-view.component').then((m) => m.ExcelViewComponent);

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
        path: 'finance-grid-new',
        title: "New Financial Portfolio",
        loadComponent: loadFinanceGridNew
      },
      {
        path: 'grid-fintech-100k',
        title: "FinTech 100K",
        loadComponent: loadGridFintech100k
      },
      {
        path: 'sales',
        title: "Sales",
        component: SalesViewComponent
      },
      {
        path: 'sales-dashboard',
        title: "Sales KPI Dashboard",
        loadComponent: loadSalesDashboard
      },
      {
        path: 'fleet',
        title: "Fleet Management",
        component: FleetManagementViewComponent
      },
      {
        path: 'fleet-management-new',
        title: "New Fleet Management",
        loadComponent: loadFleetManagementNew
      },
      {
        path: 'grid-fintech-dock-manager',
        title: "FinTech Dock Manager",
        loadComponent: loadGridFintechDockManager
      },
      {
        path: 'excel',
        title: "Budget Planning Workbook",
        loadComponent: loadExcel
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
    path: 'finance-grid-new',
    title: "New Financial Portfolio",
    loadComponent: loadFinanceGridNew
  },
  {
    path: 'grid-fintech-100k',
    title: "FinTech 100K",
    loadComponent: loadGridFintech100k
  },
  {
    path: 'sales',
    title: "Sales",
    component: SalesViewComponent
  },
  {
    path: 'sales-dashboard',
    title: "Sales KPI Dashboard",
    loadComponent: loadSalesDashboard
  },
  {
    path: 'fleet',
    title: "Fleet Management",
    component: FleetManagementViewComponent
  },
  {
    path: 'fleet-management-new',
    title: "New Fleet Management",
    loadComponent: loadFleetManagementNew
  },
  {
    path: 'grid-fintech-dock-manager',
    title: "FinTech Dock Manager",
    loadComponent: loadGridFintechDockManager
  },
  {
    path: 'excel',
    title: "Budget Planning Workbook",
    loadComponent: loadExcel
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
