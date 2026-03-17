import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { BrnProgressImports } from '@spartan-ng/brain/progress';
import { BrnSeparatorImports } from '@spartan-ng/brain/separator';
import { AuthService } from '../auth/services/auth.service';
import { SiteService } from '../core/services/site.service';
import { ReportService } from '../core/services/report.service';
import { SiteResponse } from '../core/models/site.model';
import { ReportResponse, ReportLineResponse } from '../core/models/report.model';
import { HlmButtonDirective } from '../shared/ui/hlm-button.directive';
import { HlmBadgeDirective } from '../shared/ui/hlm-badge.directive';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DatePipe,
    BrnTabsImports,
    BrnProgressImports,
    BrnSeparatorImports,
    HlmButtonDirective,
    HlmBadgeDirective,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly siteService = inject(SiteService);
  private readonly reportService = inject(ReportService);

  readonly user = this.authService.currentUser;

  readonly sites = signal<SiteResponse[]>([]);
  readonly selectedSiteId = signal<string | null>(null);
  readonly selectedSite = computed(
    () => this.sites().find((s) => s.id === this.selectedSiteId()) ?? null,
  );

  readonly loadingReports = signal(false);
  readonly reports = signal<ReportResponse[]>([]);

  readonly constructionReport = computed(() =>
    this.reports().find((r) => r.type === 'CONSTRUCTION') ?? null,
  );
  readonly exploitationReports = computed(() =>
    this.reports().filter((r) => r.type === 'EXPLOITATION'),
  );
  readonly latestReport = computed(() => this.reports()[0] ?? null);

  readonly activeTab = signal('overview');

  readonly donutCircumference = 2 * Math.PI * 70;

  readonly constructionCo2 = computed(() => this.constructionReport()?.totalCo2e ?? 0);
  readonly exploitationCo2 = computed(() =>
    this.exploitationReports().reduce((sum, r) => sum + r.totalCo2e, 0),
  );
  readonly totalCo2 = computed(() => this.constructionCo2() + this.exploitationCo2());
  readonly totalCo2T = computed(() => this.totalCo2() / 1000);

  readonly donutConstruction = computed(() => {
    const total = this.totalCo2();
    if (!total || !this.constructionCo2()) return { len: 0, pct: 0 };
    const pct = (this.constructionCo2() / total) * 100;
    return { len: (pct / 100) * this.donutCircumference, pct };
  });

  readonly donutExploitation = computed(() => {
    const total = this.totalCo2();
    if (!total || !this.exploitationCo2()) return { len: 0, pct: 0 };
    const pct = (this.exploitationCo2() / total) * 100;
    return { len: (pct / 100) * this.donutCircumference, pct };
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id || null);
    this.reports.set([]);
    if (!id) return;

    this.loadingReports.set(true);
    this.reportService.getBySiteId(id).subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loadingReports.set(false);
      },
      error: () => this.loadingReports.set(false),
    });
  }

  logout(): void {
    this.authService.logout();
  }

  tabClass(active: boolean): string {
    return (
      `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ` +
      (active ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground')
    );
  }
}
