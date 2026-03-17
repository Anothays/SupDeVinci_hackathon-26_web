import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialTypeService } from '../../../core/services/material-type.service';
import { MaterialTypeResponse } from '../../../core/models/material-type.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-material-types',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './material-types.component.html',
})
export class MaterialTypesComponent implements OnInit {
  private readonly service = inject(MaterialTypeService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<MaterialTypeResponse[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    unit: [''],
    co2FactorKgPerUnit: [null as number | null, Validators.required],
    source: [''],
    description: [''],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(item: MaterialTypeResponse): void {
    this.editingId.set(item.id);
    this.form.patchValue({ code: item.code, name: item.name, unit: item.unit, co2FactorKgPerUnit: item.co2FactorKgPerUnit, source: item.source, description: item.description });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = { code: v.code ?? '', name: v.name ?? '', unit: v.unit || null, co2FactorKgPerUnit: v.co2FactorKgPerUnit ?? 0, source: v.source || null, description: v.description || null };
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
