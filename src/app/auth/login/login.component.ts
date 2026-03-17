import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HlmButtonDirective } from '../../shared/ui/hlm-button.directive';
import { HlmInputDirective } from '../../shared/ui/hlm-input.directive';
import { HlmLabelDirective } from '../../shared/ui/hlm-label.directive';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmButtonDirective, HlmInputDirective, HlmLabelDirective],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  isEmailInvalid(): boolean {
    const ctrl = this.form.controls.email;
    return ctrl.invalid && ctrl.touched;
  }

  isPasswordInvalid(): boolean {
    const ctrl = this.form.controls.password;
    return ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Identifiants incorrects. Veuillez réessayer.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      },
    });
  }
}
