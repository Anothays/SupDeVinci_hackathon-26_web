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
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'parking-types',
        loadComponent: () =>
          import('./pages/parking-types/parking-types.component').then(
            (m) => m.ParkingTypesComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/history/history.component').then((m) => m.HistoryComponent),
      },
      // Redirections des anciennes routes
      { path: 'material-types', redirectTo: 'reports' },
      { path: 'energy-factors', redirectTo: 'parking-types' },
      { path: 'site-energy', redirectTo: 'reports' },
      { path: 'site-materials', redirectTo: 'reports' },
      { path: 'site-parking', redirectTo: 'sites' },
      { path: 'carbon-reports', redirectTo: 'reports' },
    ],
  },
];
