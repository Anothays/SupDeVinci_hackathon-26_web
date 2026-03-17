import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../../core/tokens/api-url.token';
import { UserResponse } from '../../core/models/user.model';

interface AuthResponse {
  token: string;
  type: string;
  user: UserResponse;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = inject(API_URL);

  private readonly _token = signal<string | null>(localStorage.getItem('auth_token'));
  private readonly _user = signal<UserResponse | null>(
    JSON.parse(localStorage.getItem('auth_user') ?? 'null'),
  );

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly currentUser = this._user.asReadonly();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap(({ token, user }) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        this._token.set(token);
        this._user.set(user);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
