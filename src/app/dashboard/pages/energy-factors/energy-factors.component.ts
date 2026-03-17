import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnergyEmissionFactorService } from '../../../core/services/energy-emission-factor.service';
import { EnergyEmissionFactorResponse, EnergySource, ENERGY_SOURCE_LABELS } from '../../../core/models/energy-emission-factor.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-energy-factors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './energy-factors.component.html',
})
export class EnergyFactorsComponent implements OnInit {
  private readonly service = inject(EnergyEmissionFactorService);
  private readonly fb = inject(FormBuilder);

  readonly energySources: EnergySource[] = ['ELECTRICITE', 'GAZ_NATUREL', 'FIOUL', 'BOIS_BIOMASSE', 'AUTRE'];
  readonly items = signal<EnergyEmissionFactorResponse[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    source: ['ELECTRICITE' as EnergySource, Validators.required],
    countryCode: ['FR', Validators.required],
    year: [null as number | null, Validators.required],
    factorKgCo2PerKwh: [null as number | null, Validators.required],
    sourceName: [''],
  });

  ngOnInit(): void { this.load(); }

  sourceLabel(source: EnergySource): string {
    return ENERGY_SOURCE_LABELS[source] ?? source;
  }

  private load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ source: 'ELECTRICITE', countryCode: 'FR' });
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(item: EnergyEmissionFactorResponse): void {
    this.editingId.set(item.id);
    this.form.patchValue({ source: item.source, countryCode: item.countryCode, year: item.year, factorKgCo2PerKwh: item.factorKgCo2PerKwh, sourceName: item.sourceName });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = { source: v.source as EnergySource, countryCode: v.countryCode ?? 'FR', year: v.year ?? 0, factorKgCo2PerKwh: v.factorKgCo2PerKwh ?? 0, sourceName: v.sourceName || null };
    const id = this.editingId();
    const req$ = id ? this.service.update(id, payload) : this.service.create(payload);
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
    this.service.delete(id).subscribe({ next: () => { this.deletingId.set(null); this.load(); }, error: () => this.deletingId.set(null) });
  }
}
