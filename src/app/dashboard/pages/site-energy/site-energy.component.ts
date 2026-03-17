import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteEnergyConsumptionService } from '../../../core/services/site-energy-consumption.service';
import { SiteService } from '../../../core/services/site.service';
import { SiteEnergyConsumptionResponse } from '../../../core/models/site-energy-consumption.model';
import { EnergySource, ENERGY_SOURCE_LABELS } from '../../../core/models/energy-emission-factor.model';
import { SiteResponse } from '../../../core/models/site.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-site-energy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './site-energy.component.html',
})
export class SiteEnergyComponent implements OnInit {
  private readonly energyService = inject(SiteEnergyConsumptionService);
  private readonly siteService = inject(SiteService);
  private readonly fb = inject(FormBuilder);

  readonly energySources: EnergySource[] = ['ELECTRICITE', 'GAZ_NATUREL', 'FIOUL', 'BOIS_BIOMASSE', 'AUTRE'];
  readonly sites = signal<SiteResponse[]>([]);
  readonly items = signal<SiteEnergyConsumptionResponse[]>([]);
  readonly selectedSiteId = signal<string>('');
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    source: ['ELECTRICITE' as EnergySource, Validators.required],
    year: [null as number | null, Validators.required],
    consumptionMwh: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
  }

  sourceLabel(source: EnergySource): string {
    return ENERGY_SOURCE_LABELS[source] ?? source;
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id);
    this.items.set([]);
    if (!id) return;
    this.loading.set(true);
    this.energyService.getBySite(id).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private reload(): void {
    const id = this.selectedSiteId();
    if (!id) return;
    this.energyService.getBySite(id).subscribe((data) => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ source: 'ELECTRICITE' });
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(item: SiteEnergyConsumptionResponse): void {
    this.editingId.set(item.id);
    this.form.patchValue({ source: item.source, year: item.year, consumptionMwh: item.consumptionMwh });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const siteId = this.selectedSiteId();
    const v = this.form.getRawValue();
    const payload = { source: v.source as EnergySource, year: v.year ?? 0, consumptionMwh: v.consumptionMwh ?? 0 };
    const id = this.editingId();
    const req$ = id
      ? this.energyService.update(siteId, id, payload)
      : this.energyService.create(siteId, payload);
    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.reload(); },
      error: () => { this.saving.set(false); this.error.set('Une erreur est survenue.'); },
    });
  }

  askDelete(id: string): void { this.deletingId.set(id); }
  cancelDelete(): void { this.deletingId.set(null); }
  confirmDelete(): void {
    const id = this.deletingId();
    if (!id) return;
    this.energyService.delete(this.selectedSiteId(), id).subscribe({
      next: () => { this.deletingId.set(null); this.reload(); },
      error: () => this.deletingId.set(null),
    });
  }
}
