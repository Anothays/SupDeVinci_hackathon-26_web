import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { SiteResponse } from '../models/site.model';

export interface CreateSiteRequest {
  userId: string;
  name: string;
  address: string | null;
  city: string | null;
  totalSurfaceM2: number | null;
  employeeCount: number | null;
  workstationCount: number | null;
  constructionYear: number | null;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class SiteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<SiteResponse[]> {
    return this.http.get<SiteResponse[]>(`${this.apiUrl}/api/sites`);
  }

  getById(id: string): Observable<SiteResponse> {
    return this.http.get<SiteResponse>(`${this.apiUrl}/api/sites/${id}`);
  }

  create(request: CreateSiteRequest): Observable<SiteResponse> {
    return this.http.post<SiteResponse>(`${this.apiUrl}/api/sites`, request);
  }

  update(id: string, request: Partial<CreateSiteRequest>): Observable<SiteResponse> {
    return this.http.put<SiteResponse>(`${this.apiUrl}/api/sites/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/sites/${id}`);
  }
}
