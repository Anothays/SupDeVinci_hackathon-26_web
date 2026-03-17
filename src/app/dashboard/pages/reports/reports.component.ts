import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ReportService } from '../../../core/services/report.service';
import { SiteService } from '../../../core/services/site.service';
import { AdemeService } from '../../../core/services/ademe.service';
import { ReportResponse, ReportLineResponse } from '../../../core/models/report.model';
import { SiteResponse, MaterialInput } from '../../../core/models/site.model';
import { AdemeResult } from '../../../core/models/ademe.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly siteService = inject(SiteService);
  private readonly ademeService = inject(AdemeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly reports = signal<ReportResponse[]>([]);
  readonly sites = signal<SiteResponse[]>([]);
  readonly siteFilter = signal<string>('');
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly selectedReport = signal<ReportResponse | null>(null);

  // ADEME autocomplete
  readonly ademeQuery = signal('');
  readonly ademeResults = signal<AdemeResult[]>([]);
  readonly ademeLoading = signal(false);
  readonly showAdemeDropdown = signal(false);
  readonly addedLines = signal<MaterialInput[]>([]);

  private readonly ademeSearch$ = new Subject<string>();

  readonly filteredReports = computed(() => {
    const filter = this.siteFilter();
    if (!filter) return this.reports();
    return this.reports().filter((r) => r.siteId === filter);
  });

  readonly form = this.fb.group({
    siteId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
    this.load();

    this.ademeSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q.trim()) {
            this.ademeResults.set([]);
            this.ademeLoading.set(false);
            return [];
          }
          this.ademeLoading.set(true);
          return this.ademeService.search(q);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (results) => {
          this.ademeResults.set(results);
          this.ademeLoading.set(false);
          this.showAdemeDropdown.set(results.length > 0);
        },
        error: () => {
          this.ademeLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.loading.set(true);
    this.reportService.getAll().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSiteFilter(event: Event): void {
    this.siteFilter.set((event.target as HTMLSelectElement).value);
  }

  openDetail(report: ReportResponse): void {
    this.selectedReport.set(report);
  }

  closeDetail(): void {
    this.selectedReport.set(null);
  }

  openCreate(): void {
    this.form.reset();
    this.addedLines.set([]);
    this.ademeQuery.set('');
    this.ademeResults.set([]);
    this.showAdemeDropdown.set(false);
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.reset();
    this.addedLines.set([]);
    this.showAdemeDropdown.set(false);
  }

  onAdemeSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.ademeQuery.set(q);
    this.ademeSearch$.next(q);
  }

  selectAdemeResult(result: AdemeResult): void {
    this.addedLines.update((lines) => [
      ...lines,
      {
        label: result.nomBase,
        quantity: 0,
        unit: result.uniteFr,
        feValueAtTime: result.totalPosteNonDecompose,
      },
    ]);
    this.ademeQuery.set('');
    this.ademeResults.set([]);
    this.showAdemeDropdown.set(false);
  }

  updateLineQuantity(index: number, event: Event): void {
    const qty = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.addedLines.update((lines) =>
      lines.map((l, i) => (i === index ? { ...l, quantity: qty } : l)),
    );
  }

  removeLine(index: number): void {
    this.addedLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  hideAdemeDropdown(): void {
    setTimeout(() => this.showAdemeDropdown.set(false), 200);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const payload = {
      siteId: v.siteId ?? '',
      startDate: v.startDate ?? '',
      endDate: v.endDate ?? '',
      lines: this.addedLines(),
    };

    this.reportService.createExploitation(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Une erreur est survenue.');
      },
    });
  }

  askDelete(id: string): void {
    this.deletingId.set(id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  confirmDelete(): void {
    const id = this.deletingId();
    if (!id) return;
    this.reportService.delete(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }

  typeLabel(type: 'CONSTRUCTION' | 'EXPLOITATION'): string {
    return type === 'CONSTRUCTION' ? 'Construction' : 'Exploitation';
  }
}
