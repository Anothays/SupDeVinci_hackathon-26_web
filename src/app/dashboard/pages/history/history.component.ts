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

// ─── Types internes ────────────────────────────────────────────────────────────

interface ChartPoint {
  svgX: number;
  svgY: number;
  value: number;     // valeur dans l'unité affichée
  report: ReportResponse;
  periodLabel: string;
}

// ─── Constantes SVG ───────────────────────────────────────────────────────────

const SVG_W = 760;
const SVG_H = 320;
const MARGIN = { top: 28, right: 28, bottom: 60, left: 78 };
const CHART_W = SVG_W - MARGIN.left - MARGIN.right;  // 654
const CHART_H = SVG_H - MARGIN.top - MARGIN.bottom;  // 232

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  private readonly siteService = inject(SiteService);
  private readonly reportService = inject(ReportService);

  // ─── État ──────────────────────────────────────────────────────────────────
  readonly sites = signal<SiteResponse[]>([]);
  readonly selectedSiteId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly reports = signal<ReportResponse[]>([]);

  /** Durée de vie du bâtiment pour amortissement construction (années) */
  readonly lifetimeYears = signal(50);

  /** Métrique affichée : totalCo2e (en t) ou co2PerM2 (en kg/m²) */
  readonly metric = signal<'total' | 'intensity'>('total');

  /** Point survolé */
  readonly hoveredPoint = signal<ChartPoint | null>(null);

  // ─── Données dérivées ──────────────────────────────────────────────────────

  readonly selectedSite = computed(() =>
    this.sites().find((s) => s.id === this.selectedSiteId()) ?? null,
  );

  readonly constructionReport = computed(() =>
    this.reports().find((r) => r.type === 'CONSTRUCTION') ?? null,
  );

  readonly exploitationReports = computed(() =>
    this.reports()
      .filter((r) => r.type === 'EXPLOITATION')
      .sort((a, b) => this.dateOf(a).getTime() - this.dateOf(b).getTime()),
  );

  /** CO₂ construction amorti par an */
  readonly amortizedConstructionCo2PerYear = computed(() => {
    const c = this.constructionReport();
    if (!c) return null;
    return c.totalCo2e / this.lifetimeYears();  // kgCO2e/an
  });

  /** Valeur affichée pour l'amortissement (même unité que la métrique) */
  readonly amortizedDisplay = computed(() => {
    const a = this.amortizedConstructionCo2PerYear();
    if (a === null) return null;
    if (this.metric() === 'total') return a / 1000;           // tonnes/an
    const surface = this.selectedSite()?.totalSurfaceM2;
    if (!surface || surface === 0) return null;
    return a / surface;                                        // kg/m²/an
  });

  // ─── Points du graphique ──────────────────────────────────────────────────

  readonly chartPoints = computed<ChartPoint[]>(() => {
    const reports = this.exploitationReports();
    if (reports.length === 0) return [];

    const values = reports.map((r) => this.displayValue(r));
    const maxVal = Math.max(...values, 0);
    if (maxVal === 0) return [];

    return reports.map((r, i) => {
      const x = reports.length === 1
        ? MARGIN.left + CHART_W / 2
        : MARGIN.left + (i / (reports.length - 1)) * CHART_W;
      const v = this.displayValue(r);
      const y = MARGIN.top + CHART_H - (v / (maxVal * 1.1)) * CHART_H;
      return { svgX: x, svgY: y, value: v, report: r, periodLabel: this.periodLabel(r) };
    });
  });

  /** Axe Y : 5 graduations régulières */
  readonly yTicks = computed(() => {
    const reports = this.exploitationReports();
    if (reports.length === 0) return [];
    const values = reports.map((r) => this.displayValue(r));
    const maxVal = Math.max(...values, 0) * 1.1;
    if (maxVal === 0) return [];
    const step = this.niceStep(maxVal, 5);
    const ticks: { y: number; label: string }[] = [];
    for (let v = 0; v <= maxVal; v += step) {
      const y = MARGIN.top + CHART_H - (v / maxVal) * CHART_H;
      ticks.push({ y, label: this.metric() === 'total' ? `${(v).toFixed(1)} t` : `${v.toFixed(1)}` });
    }
    return ticks;
  });

  /** Position SVG Y de la ligne d'amortissement */
  readonly amortizedLineY = computed(() => {
    const a = this.amortizedDisplay();
    if (a === null) return null;
    const reports = this.exploitationReports();
    if (reports.length === 0) return null;
    const values = reports.map((r) => this.displayValue(r));
    const maxVal = Math.max(...values, 0) * 1.1;
    if (maxVal === 0 || a > maxVal) return null;
    return MARGIN.top + CHART_H - (a / maxVal) * CHART_H;
  });

  /** Polyline points string */
  readonly polylinePoints = computed(() =>
    this.chartPoints()
      .map((p) => `${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`)
      .join(' '),
  );

  /** Zone de remplissage (area) sous la courbe */
  readonly areaPath = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return '';
    const baseline = MARGIN.top + CHART_H;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.map((p) => `${p.svgX.toFixed(1)},${p.svgY.toFixed(1)}`).join(' ');
    return `M${first.svgX.toFixed(1)},${baseline} L${line} L${last.svgX.toFixed(1)},${baseline} Z`;
  });

  // ─── KPIs historiques ──────────────────────────────────────────────────────

  readonly kpiTotal = computed(() =>
    this.exploitationReports().reduce((s, r) => s + r.totalCo2e, 0),
  );

  readonly kpiAverage = computed(() => {
    const n = this.exploitationReports().length;
    return n > 0 ? this.kpiTotal() / n : 0;
  });

  readonly kpiTrend = computed<'up' | 'down' | 'stable' | null>(() => {
    const pts = this.chartPoints();
    if (pts.length < 2) return null;
    const first = pts[0].value;
    const last = pts[pts.length - 1].value;
    const delta = (last - first) / first;
    if (delta > 0.03) return 'up';
    if (delta < -0.03) return 'down';
    return 'stable';
  });

  readonly kpiTrendPct = computed(() => {
    const pts = this.chartPoints();
    if (pts.length < 2) return null;
    const first = pts[0].value;
    const last = pts[pts.length - 1].value;
    return ((last - first) / first) * 100;
  });

  readonly kpiBestPeriod = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return null;
    return pts.reduce((min, p) => (p.value < min.value ? p : min));
  });

  readonly kpiWorstPeriod = computed(() => {
    const pts = this.chartPoints();
    if (pts.length === 0) return null;
    return pts.reduce((max, p) => (p.value > max.value ? p : max));
  });

  // ─── Constantes exposées au template ──────────────────────────────────────
  readonly svgW = SVG_W;
  readonly svgH = SVG_H;
  readonly marginLeft = MARGIN.left;
  readonly marginTop = MARGIN.top;
  readonly marginBottom = MARGIN.bottom;
  readonly chartH = CHART_H;
  readonly chartW = CHART_W;

  // ─── Cycle de vie ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.siteService.getAll().subscribe((s) => this.sites.set(s));
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id || null);
    this.reports.set([]);
    this.hoveredPoint.set(null);
    if (!id) return;
    this.loading.set(true);
    this.reportService.getBySiteId(id).subscribe({
      next: (r) => { this.reports.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onLifetimeChange(event: Event): void {
    const v = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(v) && v > 0) this.lifetimeYears.set(v);
  }

  setMetric(m: 'total' | 'intensity'): void {
    this.metric.set(m);
    this.hoveredPoint.set(null);
  }

  hoverPoint(p: ChartPoint | null): void {
    this.hoveredPoint.set(p);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private displayValue(r: ReportResponse): number {
    if (this.metric() === 'total') return r.totalCo2e / 1000;    // tonnes
    return r.co2PerM2 ?? 0;                                       // kg/m²
  }

  private dateOf(r: ReportResponse): Date {
    return r.startDate ? new Date(r.startDate) : new Date(r.createdAt);
  }

  private periodLabel(r: ReportResponse): string {
    if (r.startDate && r.endDate) {
      const s = new Date(r.startDate);
      const e = new Date(r.endDate);
      if (s.getFullYear() === e.getFullYear()) return String(s.getFullYear());
      return `${s.getFullYear()}–${e.getFullYear()}`;
    }
    return new Date(r.createdAt).getFullYear().toString();
  }

  private niceStep(max: number, targetTicks: number): number {
    const rough = max / targetTicks;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const frac = rough / pow;
    let nice: number;
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else nice = 10;
    return nice * pow;
  }

  metricLabel(): string {
    return this.metric() === 'total' ? 'tCO₂e' : 'kgCO₂e/m²';
  }
}
