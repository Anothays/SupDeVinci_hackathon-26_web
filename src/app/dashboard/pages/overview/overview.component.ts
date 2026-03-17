import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { SiteService } from '../../../core/services/site.service';
import { ReportService } from '../../../core/services/report.service';
import { SiteResponse } from '../../../core/models/site.model';
import { ReportResponse } from '../../../core/models/report.model';
import { HlmBadgeDirective } from '../../../shared/ui/hlm-badge.directive';

interface SiteStats {
  site: SiteResponse;
  reports: ReportResponse[];
  constructionReport: ReportResponse | null;
  exploitationReports: ReportResponse[];
  constructionCo2: number;
  exploitationCo2: number;
  totalCo2: number;
}

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DatePipe, HlmBadgeDirective],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  private readonly siteService = inject(SiteService);
  private readonly reportService = inject(ReportService);

  readonly sites = signal<SiteResponse[]>([]);

  // Site A
  readonly selectedSiteIdA = signal<string | null>(null);
  readonly loadingA = signal(false);
  readonly reportsA = signal<ReportResponse[]>([]);

  // Site B (comparaison)
  readonly compareMode = signal(false);
  readonly selectedSiteIdB = signal<string | null>(null);
  readonly loadingB = signal(false);
  readonly reportsB = signal<ReportResponse[]>([]);

  readonly activeTab = signal<'repartition' | 'rapports' | 'comparaison'>('repartition');

  // ─── Stats site A ─────────────────────────────────────────────────────────
  readonly statsA = computed<SiteStats | null>(() => {
    const id = this.selectedSiteIdA();
    const site = this.sites().find((s) => s.id === id) ?? null;
    if (!site) return null;
    return this.buildStats(site, this.reportsA());
  });

  // ─── Stats site B ─────────────────────────────────────────────────────────
  readonly statsB = computed<SiteStats | null>(() => {
    if (!this.compareMode()) return null;
    const id = this.selectedSiteIdB();
    const site = this.sites().find((s) => s.id === id) ?? null;
    if (!site) return null;
    return this.buildStats(site, this.reportsB());
  });

  readonly donutCircumference = 2 * Math.PI * 70;

  readonly donutA = computed(() => this.buildDonut(this.statsA()));
  readonly donutB = computed(() => this.buildDonut(this.statsB()));

  // Sites disponibles pour le sélecteur B (exclut le site A)
  readonly sitesForB = computed(() =>
    this.sites().filter((s) => s.id !== this.selectedSiteIdA()),
  );

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
  }

  onSiteChangeA(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteIdA.set(id || null);
    this.reportsA.set([]);
    if (!id) return;
    this.loadingA.set(true);
    this.reportService.getBySiteId(id).subscribe({
      next: (reports) => {
        this.reportsA.set(reports);
        this.loadingA.set(false);
      },
      error: () => this.loadingA.set(false),
    });
  }

  onSiteChangeB(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteIdB.set(id || null);
    this.reportsB.set([]);
    if (!id) return;
    this.loadingB.set(true);
    this.reportService.getBySiteId(id).subscribe({
      next: (reports) => {
        this.reportsB.set(reports);
        this.loadingB.set(false);
      },
      error: () => this.loadingB.set(false),
    });
  }

  toggleCompare(): void {
    const next = !this.compareMode();
    this.compareMode.set(next);
    if (!next) {
      this.selectedSiteIdB.set(null);
      this.reportsB.set([]);
    }
    if (next && this.activeTab() !== 'comparaison') {
      this.activeTab.set('comparaison');
    }
  }

  setTab(tab: 'repartition' | 'rapports' | 'comparaison'): void {
    this.activeTab.set(tab);
  }

  private buildStats(site: SiteResponse, reports: ReportResponse[]): SiteStats {
    const constructionReport = reports.find((r) => r.type === 'CONSTRUCTION') ?? null;
    const exploitationReports = reports.filter((r) => r.type === 'EXPLOITATION');
    const constructionCo2 = constructionReport?.totalCo2e ?? 0;
    const exploitationCo2 = exploitationReports.reduce((s, r) => s + r.totalCo2e, 0);
    return {
      site,
      reports,
      constructionReport,
      exploitationReports,
      constructionCo2,
      exploitationCo2,
      totalCo2: constructionCo2 + exploitationCo2,
    };
  }

  private buildDonut(stats: SiteStats | null): {
    constructionLen: number;
    exploitationLen: number;
    constructionPct: number;
    exploitationPct: number;
  } {
    const zero = { constructionLen: 0, exploitationLen: 0, constructionPct: 0, exploitationPct: 0 };
    if (!stats || stats.totalCo2 === 0) return zero;
    const cPct = (stats.constructionCo2 / stats.totalCo2) * 100;
    const ePct = (stats.exploitationCo2 / stats.totalCo2) * 100;
    return {
      constructionLen: (cPct / 100) * this.donutCircumference,
      exploitationLen: (ePct / 100) * this.donutCircumference,
      constructionPct: cPct,
      exploitationPct: ePct,
    };
  }

  co2PerM2(stats: SiteStats | null): number | null {
    if (!stats || stats.totalCo2 === 0 || !stats.site.totalSurfaceM2) return null;
    return stats.totalCo2 / stats.site.totalSurfaceM2;
  }

  co2PerEmployee(stats: SiteStats | null): number | null {
    if (!stats || stats.totalCo2 === 0 || !stats.site.totalEmployees) return null;
    return stats.totalCo2 / stats.site.totalEmployees;
  }
}
