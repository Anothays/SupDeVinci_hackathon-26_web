import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  iconPath: string;
}

@Component({
  selector: 'app-dashboard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
  readonly sidebarOpen = signal(true);

  readonly navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      path: '/dashboard/overview',
      iconPath:
        'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    },
    {
      label: 'Sites',
      path: '/dashboard/sites',
      iconPath:
        'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    },
    {
      label: 'Utilisateurs',
      path: '/dashboard/users',
      iconPath:
        'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    },
    {
      label: 'Types de matériaux',
      path: '/dashboard/material-types',
      iconPath:
        'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
    },
    {
      label: 'Facteurs d\'émission',
      path: '/dashboard/energy-factors',
      iconPath:
        'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    },
    {
      label: 'Consommations énergie',
      path: '/dashboard/site-energy',
      iconPath:
        'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    },
    {
      label: 'Matériaux de site',
      path: '/dashboard/site-materials',
      iconPath:
        'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    },
    {
      label: 'Parkings',
      path: '/dashboard/site-parking',
      iconPath:
        'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3 M9 17H7 M13 17h-2 M17 17h4a2 2 0 0 0 0-4h-1V9a3 3 0 0 0-3-3H7',
    },
    {
      label: 'Rapports carbone',
      path: '/dashboard/carbon-reports',
      iconPath:
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
  ];

  logout(): void {
    this.authService.logout();
  }
}
