import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarbonReportService } from '../../../core/services/carbon-report.service';
import { SiteService } from '../../../core/services/site.service';
import { CarbonReportResponse } from '../../../core/models/carbon-report.model';
import { SiteResponse } from '../../../core/models/site.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-carbon-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './carbon-reports.component.html',
})
export class CarbonReportsComponent implements OnInit {
  private readonly reportService = inject(CarbonReportService);
  private readonly siteService = inject(SiteService);
  private readonly fb = inject(FormBuilder);

  readonly reports = signal<CarbonReportResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly siteFilter = signal<string>('');
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly filteredReports = computed(() => {
    const filter = this.siteFilter();
    if (!filter) return this.reports();
    return this.reports().filter((r) => r.siteId === filter);
  });

  readonly form = this.fb.group({
    siteId: ['', Validators.required],
    referenceYear: [null as number | null],
    constructionCo2Kg: [null as number | null],
    exploitationCo2Kg: [null as number | null],
    co2PerM2: [null as number | null],
    co2PerEmployee: [null as number | null],
    notes: [''],
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.reportService.getAll().subscribe({
      next: (data) => { this.reports.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSiteFilter(event: Event): void {
    this.siteFilter.set((event.target as HTMLSelectElement).value);
  }

  siteName(siteId: string): string {
    return this.sites().find((s) => s.id === siteId)?.name ?? siteId;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(report: CarbonReportResponse): void {
    this.editingId.set(report.id);
    this.form.patchValue({
      siteId: report.siteId,
      referenceYear: report.referenceYear,
      constructionCo2Kg: report.constructionCo2Kg,
      exploitationCo2Kg: report.exploitationCo2Kg,
      co2PerM2: report.co2PerM2,
      co2PerEmployee: report.co2PerEmployee,
      notes: report.notes,
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = {
      siteId: v.siteId ?? '',
      referenceYear: v.referenceYear,
      constructionCo2Kg: v.constructionCo2Kg,
      exploitationCo2Kg: v.exploitationCo2Kg,
      co2PerM2: v.co2PerM2,
      co2PerEmployee: v.co2PerEmployee,
      notes: v.notes || null,
    };
    const id = this.editingId();
    const req$ = id ? this.reportService.update(id, payload) : this.reportService.create(payload);
    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => { this.saving.set(false); this.error.set('Une erreur est survenue.'); },
    });
  }

  askDelete(id: string): void { this.deletingId.set(id); }
  cancelDelete(): void { this.deletingId.set(null); }
  confirmDelete(): void {
    const id = this.deletingId();
    if (!id) return;
    this.reportService.delete(id).subscribe({ next: () => { this.deletingId.set(null); this.load(); }, error: () => this.deletingId.set(null) });
  }
}
