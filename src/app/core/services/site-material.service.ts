import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import {
  CreateSiteMaterialRequest,
  SiteMaterialResponse,
} from '../models/site-material.model';

@Injectable({ providedIn: 'root' })
export class SiteMaterialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getBySite(siteId: string): Observable<SiteMaterialResponse[]> {
    return this.http.get<SiteMaterialResponse[]>(
      `${this.apiUrl}/api/sites/${siteId}/materials`,
    );
  }

  create(siteId: string, request: CreateSiteMaterialRequest): Observable<SiteMaterialResponse> {
    return this.http.post<SiteMaterialResponse>(
      `${this.apiUrl}/api/sites/${siteId}/materials`,
      request,
    );
  }

  update(
    siteId: string,
    id: string,
    request: Partial<CreateSiteMaterialRequest>,
  ): Observable<SiteMaterialResponse> {
    return this.http.put<SiteMaterialResponse>(
      `${this.apiUrl}/api/sites/${siteId}/materials/${id}`,
      request,
    );
  }

  delete(siteId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/sites/${siteId}/materials/${id}`);
  }
}
