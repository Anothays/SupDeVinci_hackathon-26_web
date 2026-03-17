import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import {
  CreateEnergyEmissionFactorRequest,
  EnergyEmissionFactorResponse,
} from '../models/energy-emission-factor.model';

@Injectable({ providedIn: 'root' })
export class EnergyEmissionFactorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<EnergyEmissionFactorResponse[]> {
    return this.http.get<EnergyEmissionFactorResponse[]>(
      `${this.apiUrl}/api/energy-emission-factors`,
    );
  }

  getById(id: string): Observable<EnergyEmissionFactorResponse> {
    return this.http.get<EnergyEmissionFactorResponse>(
      `${this.apiUrl}/api/energy-emission-factors/${id}`,
    );
  }

  create(request: CreateEnergyEmissionFactorRequest): Observable<EnergyEmissionFactorResponse> {
    return this.http.post<EnergyEmissionFactorResponse>(
      `${this.apiUrl}/api/energy-emission-factors`,
      request,
    );
  }

  update(
    id: string,
    request: Partial<CreateEnergyEmissionFactorRequest>,
  ): Observable<EnergyEmissionFactorResponse> {
    return this.http.put<EnergyEmissionFactorResponse>(
      `${this.apiUrl}/api/energy-emission-factors/${id}`,
      request,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/energy-emission-factors/${id}`);
  }
}
