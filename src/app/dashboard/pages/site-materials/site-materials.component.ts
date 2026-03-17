import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteMaterialService } from '../../../core/services/site-material.service';
import { MaterialTypeService } from '../../../core/services/material-type.service';
import { SiteService } from '../../../core/services/site.service';
import { SiteMaterialResponse } from '../../../core/models/site-material.model';
import { MaterialTypeResponse } from '../../../core/models/material-type.model';
import { SiteResponse } from '../../../core/models/site.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-site-materials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './site-materials.component.html',
})
export class SiteMaterialsComponent implements OnInit {
  private readonly materialService = inject(SiteMaterialService);
  private readonly materialTypeService = inject(MaterialTypeService);
  private readonly siteService = inject(SiteService);
  private readonly fb = inject(FormBuilder);

  readonly sites = signal<SiteResponse[]>([]);
  readonly materialTypes = signal<MaterialTypeResponse[]>([]);
  readonly items = signal<SiteMaterialResponse[]>([]);
  readonly selectedSiteId = signal<string>('');
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    materialTypeId: ['', Validators.required],
    quantity: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
    this.materialTypeService.getAll().subscribe((types) => this.materialTypes.set(types));
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id);
    this.items.set([]);
    if (!id) return;
    this.loading.set(true);
    this.materialService.getBySite(id).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private reload(): void {
    const id = this.selectedSiteId();
    if (!id) return;
    this.materialService.getBySite(id).subscribe((data) => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(item: SiteMaterialResponse): void {
    this.editingId.set(item.id);
    this.form.patchValue({ materialTypeId: item.materialTypeId, quantity: item.quantity });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const siteId = this.selectedSiteId();
    const v = this.form.getRawValue();
    const payload = { materialTypeId: v.materialTypeId ?? '', quantity: v.quantity ?? 0 };
    const id = this.editingId();
    const req$ = id
      ? this.materialService.update(siteId, id, payload)
      : this.materialService.create(siteId, payload);
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
    this.materialService.delete(this.selectedSiteId(), id).subscribe({
      next: () => { this.deletingId.set(null); this.reload(); },
      error: () => this.deletingId.set(null),
    });
  }
}
