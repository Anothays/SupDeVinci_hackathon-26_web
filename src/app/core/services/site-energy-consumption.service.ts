import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import {
  CreateSiteEnergyConsumptionRequest,
  SiteEnergyConsumptionResponse,
} from '../models/site-energy-consumption.model';

@Injectable({ providedIn: 'root' })
export class SiteEnergyConsumptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getBySite(siteId: string): Observable<SiteEnergyConsumptionResponse[]> {
    return this.http.get<SiteEnergyConsumptionResponse[]>(
      `${this.apiUrl}/api/sites/${siteId}/energy-consumptions`,
    );
  }

  create(
    siteId: string,
    request: CreateSiteEnergyConsumptionRequest,
  ): Observable<SiteEnergyConsumptionResponse> {
    return this.http.post<SiteEnergyConsumptionResponse>(
      `${this.apiUrl}/api/sites/${siteId}/energy-consumptions`,
      request,
    );
  }

  update(
    siteId: string,
    id: string,
    request: Partial<CreateSiteEnergyConsumptionRequest>,
  ): Observable<SiteEnergyConsumptionResponse> {
    return this.http.put<SiteEnergyConsumptionResponse>(
      `${this.apiUrl}/api/sites/${siteId}/energy-consumptions/${id}`,
      request,
    );
  }

  delete(siteId: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/sites/${siteId}/energy-consumptions/${id}`,
    );
  }
}
