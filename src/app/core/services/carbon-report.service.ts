import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { CarbonReportDetailResponse, CarbonReportResponse } from '../models/carbon-report.model';

export interface CreateCarbonReportRequest {
  siteId: string;
  referenceYear: number | null;
  constructionCo2Kg: number | null;
  exploitationCo2Kg: number | null;
  co2PerM2: number | null;
  co2PerEmployee: number | null;
  notes: string | null;
}

@Injectable({ providedIn: 'root' })
export class CarbonReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<CarbonReportResponse[]> {
    return this.http.get<CarbonReportResponse[]>(`${this.apiUrl}/api/carbon-reports`);
  }

  getBySiteId(siteId: string): Observable<CarbonReportResponse[]> {
    return this.http.get<CarbonReportResponse[]>(`${this.apiUrl}/api/carbon-reports`, {
      params: { siteId },
    });
  }

  getById(id: string): Observable<CarbonReportResponse> {
    return this.http.get<CarbonReportResponse>(`${this.apiUrl}/api/carbon-reports/${id}`);
  }

  getDetails(reportId: string): Observable<CarbonReportDetailResponse[]> {
    return this.http.get<CarbonReportDetailResponse[]>(
      `${this.apiUrl}/api/carbon-reports/${reportId}/details`,
    );
  }

  create(request: CreateCarbonReportRequest): Observable<CarbonReportResponse> {
    return this.http.post<CarbonReportResponse>(`${this.apiUrl}/api/carbon-reports`, request);
  }

  update(
    id: string,
    request: Partial<CreateCarbonReportRequest>,
  ): Observable<CarbonReportResponse> {
    return this.http.put<CarbonReportResponse>(
      `${this.apiUrl}/api/carbon-reports/${id}`,
      request,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/carbon-reports/${id}`);
  }
}
