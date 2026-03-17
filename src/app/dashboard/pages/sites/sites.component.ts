import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { SiteService } from '../../../core/services/site.service';
import { ParkingTypeService } from '../../../core/services/parking-type.service';
import { AdemeService } from '../../../core/services/ademe.service';
import { SiteResponse, MaterialInput } from '../../../core/models/site.model';
import { ParkingTypeResponse } from '../../../core/models/parking-type.model';
import { AdemeResult } from '../../../core/models/ademe.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-sites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './sites.component.html',
})
export class SitesComponent implements OnInit, OnDestroy {
  private readonly siteService = inject(SiteService);
  private readonly parkingTypeService = inject(ParkingTypeService);
  private readonly ademeService = inject(AdemeService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly sites = signal<SiteResponse[]>([]);
  readonly parkingTypes = signal<ParkingTypeResponse[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  // ADEME autocomplete
  readonly ademeQuery = signal('');
  readonly ademeResults = signal<AdemeResult[]>([]);
  readonly ademeLoading = signal(false);
  readonly showAdemeDropdown = signal(false);
  readonly addedMaterials = signal<MaterialInput[]>([]);

  private readonly ademeSearch$ = new Subject<string>();

  readonly form = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    city: [''],
    totalSurfaceM2: [null as number | null, Validators.required],
    totalEmployees: [null as number | null],
    constructionYear: [null as number | null],
    parkings: this.fb.array([]),
  });

  get parkingsArray(): FormArray {
    return this.form.get('parkings') as FormArray;
  }

  ngOnInit(): void {
    this.load();
    this.parkingTypeService.getAll().subscribe((types) => this.parkingTypes.set(types));

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
    this.siteService.getAll().subscribe({
      next: (data) => {
        this.sites.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    while (this.parkingsArray.length > 0) this.parkingsArray.removeAt(0);
    this.addedMaterials.set([]);
    this.ademeResults.set([]);
    this.ademeQuery.set('');
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(site: SiteResponse): void {
    this.editingId.set(site.id);
    while (this.parkingsArray.length > 0) this.parkingsArray.removeAt(0);
    this.addedMaterials.set([]);
    this.ademeResults.set([]);
    this.ademeQuery.set('');
    this.form.patchValue({
      name: site.name,
      address: site.address,
      city: site.city,
      totalSurfaceM2: site.totalSurfaceM2,
      totalEmployees: site.totalEmployees,
      constructionYear: site.constructionYear,
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.reset();
    while (this.parkingsArray.length > 0) this.parkingsArray.removeAt(0);
    this.addedMaterials.set([]);
    this.showAdemeDropdown.set(false);
  }

  addParking(): void {
    this.parkingsArray.push(
      this.fb.group({
        parkingTypeId: ['', Validators.required],
        spotsCount: [null as number | null, Validators.required],
      }),
    );
  }

  removeParking(index: number): void {
    this.parkingsArray.removeAt(index);
  }

  onAdemeSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.ademeQuery.set(q);
    this.ademeSearch$.next(q);
  }

  selectAdemeResult(result: AdemeResult): void {
    this.addedMaterials.update((mats) => [
      ...mats,
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

  updateMaterialQuantity(index: number, event: Event): void {
    const qty = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.addedMaterials.update((mats) =>
      mats.map((m, i) => (i === index ? { ...m, quantity: qty } : m)),
    );
  }

  removeMaterial(index: number): void {
    this.addedMaterials.update((mats) => mats.filter((_, i) => i !== index));
  }

  hideAdemeDropdown(): void {
    setTimeout(() => this.showAdemeDropdown.set(false), 200);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const id = this.editingId();

    if (id) {
      // Edit: only basic fields
      const updatePayload = {
        name: value.name ?? '',
        address: value.address || null,
        city: value.city || null,
        totalSurfaceM2: value.totalSurfaceM2 ?? 0,
        totalEmployees: value.totalEmployees ?? null,
        constructionYear: value.constructionYear ?? null,
      };
      this.siteService.update(id, updatePayload).subscribe({
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
    } else {
      const createPayload = {
        name: value.name ?? '',
        address: value.address || null,
        city: value.city || null,
        totalSurfaceM2: value.totalSurfaceM2 ?? 0,
        totalEmployees: value.totalEmployees ?? null,
        constructionYear: value.constructionYear ?? null,
        parkings: (value.parkings as Array<{ parkingTypeId: string; spotsCount: number }>).map(
          (p) => ({
            parkingTypeId: p.parkingTypeId,
            spotsCount: p.spotsCount,
          }),
        ),
        materials: this.addedMaterials(),
      };
      this.siteService.create(createPayload).subscribe({
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
    this.siteService.delete(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }
}
