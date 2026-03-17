import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/user.model';
import { HlmInputDirective } from '../../../shared/ui/hlm-input.directive';

@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['USER' as 'ADMIN' | 'USER'],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ role: 'USER' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.error.set(null);
    this.showModal.set(true);
  }

  openEdit(user: UserResponse): void {
    this.editingId.set(user.id);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.patchValue({
      email: user.email,
      role: user.role,
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
    const value = this.form.getRawValue();
    const id = this.editingId();

    if (id) {
      this.userService
        .update(id, {
          email: value.email ?? '',
          role: (value.role ?? 'USER') as 'ADMIN' | 'USER',
        })
        .subscribe({
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
      this.userService
        .create({
          email: value.email ?? '',
          password: value.password ?? '',
          role: (value.role ?? 'USER') as 'ADMIN' | 'USER',
        })
        .subscribe({
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
    this.userService.delete(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }
}
