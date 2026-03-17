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
import { SiteService } from '../../../core/services/site.service';
import { CarbonReportService } from '../../../core/services/carbon-report.service';
import { SiteResponse } from '../../../core/models/site.model';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CarbonReportDetailResponse,
  CarbonReportResponse,
} from '../../../core/models/carbon-report.model';
import { HlmBadgeDirective } from '../../../shared/ui/hlm-badge.directive';

@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DatePipe, BrnTabsImports, BrnProgressImports, BrnSeparatorImports, HlmBadgeDirective],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  private readonly siteService = inject(SiteService);
  private readonly carbonReportService = inject(CarbonReportService);

  readonly sites = signal<SiteResponse[]>([]);
  readonly selectedSiteId = signal<string | null>(null);
  readonly selectedSite = computed(() => this.sites().find((s) => s.id === this.selectedSiteId()) ?? null);

  readonly loadingReports = signal(false);
  readonly loadingDetails = signal(false);
  readonly reports = signal<CarbonReportResponse[]>([]);
  readonly latestReport = computed(() => this.reports()[0] ?? null);
  readonly reportDetails = signal<CarbonReportDetailResponse[]>([]);
  readonly activeTab = signal('overview');

  readonly donutCircumference = 2 * Math.PI * 70;
  readonly totalCo2T = computed(() => (this.latestReport()?.totalCo2Kg ?? 0) / 1000);

  readonly donutConstruction = computed(() => {
    const r = this.latestReport();
    if (!r?.totalCo2Kg || !r.constructionCo2Kg) return { len: 0, pct: 0 };
    const pct = (r.constructionCo2Kg / r.totalCo2Kg) * 100;
    return { len: (pct / 100) * this.donutCircumference, pct };
  });

  readonly donutExploitation = computed(() => {
    const r = this.latestReport();
    if (!r?.totalCo2Kg || !r.exploitationCo2Kg) return { len: 0, pct: 0 };
    const pct = (r.exploitationCo2Kg / r.totalCo2Kg) * 100;
    return { len: (pct / 100) * this.donutCircumference, pct };
  });

  readonly sortedDetails = computed(() =>
    [...this.reportDetails()].sort((a, b) => (b.co2Kg ?? 0) - (a.co2Kg ?? 0)),
  );
  readonly materialsTotal = computed(() =>
    this.reportDetails().filter((d) => d.category.startsWith('MATERIAU')).reduce((s, d) => s + (d.co2Kg ?? 0), 0),
  );
  readonly energyTotal = computed(() =>
    this.reportDetails().filter((d) => d.category.startsWith('ENERGIE')).reduce((s, d) => s + (d.co2Kg ?? 0), 0),
  );
  readonly parkingTotal = computed(() =>
    this.reportDetails().filter((d) => d.category === 'PARKING').reduce((s, d) => s + (d.co2Kg ?? 0), 0),
  );

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id || null);
    this.reports.set([]);
    this.reportDetails.set([]);
    if (!id) return;
    this.loadingReports.set(true);
    this.carbonReportService.getBySiteId(id).subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loadingReports.set(false);
        if (reports.length > 0) this.loadDetails(reports[0].id);
      },
      error: () => this.loadingReports.set(false),
    });
  }

  selectReport(report: CarbonReportResponse): void {
    const reordered = [report, ...this.reports().filter((r) => r.id !== report.id)];
    this.reports.set(reordered);
    this.loadDetails(report.id);
  }

  private loadDetails(reportId: string): void {
    this.loadingDetails.set(true);
    this.carbonReportService.getDetails(reportId).subscribe({
      next: (details) => { this.reportDetails.set(details); this.loadingDetails.set(false); },
      error: () => this.loadingDetails.set(false),
    });
  }

  tabClass(active: boolean): string {
    return (
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ' +
      (active ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground')
    );
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? '#94a3b8';
  }
}
