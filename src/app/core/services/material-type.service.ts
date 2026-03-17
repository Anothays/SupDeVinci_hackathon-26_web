import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { CreateMaterialTypeRequest, MaterialTypeResponse } from '../models/material-type.model';

@Injectable({ providedIn: 'root' })
export class MaterialTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getAll(): Observable<MaterialTypeResponse[]> {
    return this.http.get<MaterialTypeResponse[]>(`${this.apiUrl}/api/material-types`);
  }

  getById(id: string): Observable<MaterialTypeResponse> {
    return this.http.get<MaterialTypeResponse>(`${this.apiUrl}/api/material-types/${id}`);
  }

  create(request: CreateMaterialTypeRequest): Observable<MaterialTypeResponse> {
    return this.http.post<MaterialTypeResponse>(`${this.apiUrl}/api/material-types`, request);
  }

  update(
    id: string,
    request: Partial<CreateMaterialTypeRequest>,
  ): Observable<MaterialTypeResponse> {
    return this.http.put<MaterialTypeResponse>(`${this.apiUrl}/api/material-types/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/material-types/${id}`);
  }
}
