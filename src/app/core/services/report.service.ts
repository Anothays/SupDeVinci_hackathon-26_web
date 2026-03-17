import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { CreateExploitationReportRequest, ReportResponse } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/api/reports`);
  }

  getById(id: string): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(`${this.apiUrl}/api/reports/${id}`);
  }

  getBySiteId(siteId: string): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(`${this.apiUrl}/api/sites/${siteId}/reports`);
  }

  createExploitation(req: CreateExploitationReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/api/reports/exploitation`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/reports/${id}`);
  }
}
