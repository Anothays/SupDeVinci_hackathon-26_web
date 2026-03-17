import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteParkingService } from '../../../core/services/site-parking.service';
import { SiteService } from '../../../core/services/site.service';
import { SiteParkingResponse, ParkingType, PARKING_TYPE_LABELS } from '../../../core/models/site-parking.model';
import { SiteResponse } from '../../../core/models/site.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-site-parking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmInputDirective],
  templateUrl: './site-parking.component.html',
})
export class SiteParkingComponent implements OnInit {
  private readonly parkingService = inject(SiteParkingService);
  private readonly siteService = inject(SiteService);
  private readonly fb = inject(FormBuilder);

  readonly parkingTypes: ParkingType[] = ['SOUS_DALLE', 'SOUS_SOL', 'AERIEN'];
  readonly sites = signal<SiteResponse[]>([]);
  readonly items = signal<SiteParkingResponse[]>([]);
  readonly selectedSiteId = signal<string>('');
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    type: ['SOUS_DALLE' as ParkingType, Validators.required],
    count: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.siteService.getAll().subscribe((sites) => this.sites.set(sites));
  }

  typeLabel(type: ParkingType): string {
    return PARKING_TYPE_LABELS[type] ?? type;
  }

  onSiteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedSiteId.set(id);
    this.items.set([]);
    if (!id) return;
    this.loading.set(true);
    this.parkingService.getBySite(id).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private reload(): void {
    const id = this.selectedSiteId();
    if (!id) return;
    this.parkingService.getBySite(id).subscribe((data) => this.items.set(data));
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ type: 'SOUS_DALLE' });
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(item: SiteParkingResponse): void {
    this.editingId.set(item.id);
    this.form.patchValue({ type: item.type, count: item.count });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.form.reset(); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const siteId = this.selectedSiteId();
    const v = this.form.getRawValue();
    const payload = { type: v.type as ParkingType, count: v.count ?? 0 };
    const id = this.editingId();
    const req$ = id
      ? this.parkingService.update(siteId, id, payload)
      : this.parkingService.create(siteId, payload);
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
    this.parkingService.delete(this.selectedSiteId(), id).subscribe({
      next: () => { this.deletingId.set(null); this.reload(); },
      error: () => this.deletingId.set(null),
    });
  }
}
