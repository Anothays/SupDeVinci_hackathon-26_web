import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { SiteService } from '../../../core/services/site.service';
import { SiteResponse } from '../../../core/models/site.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-sites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './sites.component.html',
})
export class SitesComponent implements OnInit {
  private readonly siteService = inject(SiteService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly sites = signal<SiteResponse[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    city: [''],
    totalSurfaceM2: [null as number | null],
    employeeCount: [null as number | null],
    workstationCount: [null as number | null],
    constructionYear: [null as number | null],
    description: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.siteService.getAll().subscribe({
      next: (data) => { this.sites.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(site: SiteResponse): void {
    this.editingId.set(site.id);
    this.form.patchValue({
      name: site.name,
      address: site.address,
      city: site.city,
      totalSurfaceM2: site.totalSurfaceM2,
      employeeCount: site.employeeCount,
      workstationCount: site.workstationCount,
      constructionYear: site.constructionYear,
      description: site.description,
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const userId = this.authService.currentUser()?.id ?? '';
    const value = this.form.getRawValue();
    const payload = {
      userId,
      name: value.name ?? '',
      address: value.address || null,
      city: value.city || null,
      totalSurfaceM2: value.totalSurfaceM2,
      employeeCount: value.employeeCount,
      workstationCount: value.workstationCount,
      constructionYear: value.constructionYear,
      description: value.description || null,
    };

    const id = this.editingId();
    const req$ = id
      ? this.siteService.update(id, payload)
      : this.siteService.create(payload);

    req$.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: () => { this.saving.set(false); this.error.set('Une erreur est survenue.'); },
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
    this.siteService.delete(id).subscribe({
      next: () => { this.deletingId.set(null); this.load(); },
      error: () => this.deletingId.set(null),
    });
  }
}
