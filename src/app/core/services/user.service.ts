import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { UserResponse } from '../models/user.model';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'USER';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.apiUrl}/api/users`);
  }

  getById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/api/users/${id}`);
  }

  create(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/api/users`, request);
  }

  update(id: string, request: Partial<CreateUserRequest>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/api/users/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/users/${id}`);
  }
}
