import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'sites',
        loadComponent: () =>
          import('./pages/sites/sites.component').then((m) => m.SitesComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'material-types',
        loadComponent: () =>
          import('./pages/material-types/material-types.component').then(
            (m) => m.MaterialTypesComponent,
          ),
      },
      {
        path: 'energy-factors',
        loadComponent: () =>
          import('./pages/energy-factors/energy-factors.component').then(
            (m) => m.EnergyFactorsComponent,
          ),
      },
      {
        path: 'site-energy',
        loadComponent: () =>
          import('./pages/site-energy/site-energy.component').then((m) => m.SiteEnergyComponent),
      },
      {
        path: 'site-materials',
        loadComponent: () =>
          import('./pages/site-materials/site-materials.component').then(
            (m) => m.SiteMaterialsComponent,
          ),
      },
      {
        path: 'site-parking',
        loadComponent: () =>
          import('./pages/site-parking/site-parking.component').then(
            (m) => m.SiteParkingComponent,
          ),
      },
      {
        path: 'carbon-reports',
        loadComponent: () =>
          import('./pages/carbon-reports/carbon-reports.component').then(
            (m) => m.CarbonReportsComponent,
          ),
      },
    ],
  },
];
