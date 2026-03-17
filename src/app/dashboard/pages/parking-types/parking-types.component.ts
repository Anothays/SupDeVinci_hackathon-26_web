import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParkingTypeService } from '../../../core/services/parking-type.service';
import { ParkingTypeResponse } from '../../../core/models/parking-type.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-parking-types',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './parking-types.component.html',
})
export class ParkingTypesComponent implements OnInit {
  private readonly parkingTypeService = inject(ParkingTypeService);
  private readonly fb = inject(FormBuilder);

  readonly parkingTypes = signal<ParkingTypeResponse[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    defaultFe: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.parkingTypeService.getAll().subscribe({
      next: (data) => {
        this.parkingTypes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startEdit(pt: ParkingTypeResponse): void {
    this.editingId.set(pt.id);
    this.form.patchValue({ defaultFe: pt.defaultFe });
    this.error.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  save(id: string): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const defaultFe = this.form.getRawValue().defaultFe ?? 0;
    this.parkingTypeService.update(id, defaultFe).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.form.reset();
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Une erreur est survenue.');
      },
    });
  }
}
