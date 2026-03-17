import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { ParkingTypeResponse } from '../models/parking-type.model';

@Injectable({ providedIn: 'root' })
export class ParkingTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<ParkingTypeResponse[]> {
    return this.http.get<ParkingTypeResponse[]>(`${this.apiUrl}/api/parking-types`);
  }

  update(id: string, defaultFe: number): Observable<ParkingTypeResponse> {
    return this.http.put<ParkingTypeResponse>(`${this.apiUrl}/api/parking-types/${id}`, {
      defaultFe,
    });
  }
}
