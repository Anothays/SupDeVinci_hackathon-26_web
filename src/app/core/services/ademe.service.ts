import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/api-url.token';
import { AdemeResult } from '../models/ademe.model';

@Injectable({ providedIn: 'root' })
export class AdemeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  search(query: string): Observable<AdemeResult[]> {
    return this.http.get<AdemeResult[]>(`${this.apiUrl}/api/ademe/search`, {
      params: { q: query },
    });
  }
}
