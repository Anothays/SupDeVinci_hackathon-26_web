import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { CreateSiteParkingRequest, SiteParkingResponse } from '../models/site-parking.model';

@Injectable({ providedIn: 'root' })
export class SiteParkingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getBySite(siteId: string): Observable<SiteParkingResponse[]> {
    return this.http.get<SiteParkingResponse[]>(
      `${this.apiUrl}/api/sites/${siteId}/parking`,
    );
  }

  create(siteId: string, request: CreateSiteParkingRequest): Observable<SiteParkingResponse> {
    return this.http.post<SiteParkingResponse>(
      `${this.apiUrl}/api/sites/${siteId}/parking`,
      request,
    );
  }

  update(
    siteId: string,
    id: string,
    request: Partial<CreateSiteParkingRequest>,
  ): Observable<SiteParkingResponse> {
    return this.http.put<SiteParkingResponse>(
      `${this.apiUrl}/api/sites/${siteId}/parking/${id}`,
      request,
    );
  }

  delete(siteId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/sites/${siteId}/parking/${id}`);
  }
}
