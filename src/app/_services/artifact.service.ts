import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArtifactSet } from '../_models/artifacts';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArtifactService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/artifacts`;

  constructor(private http: HttpClient) {}

  getArtifacts(): Observable<ArtifactSet[]> {
    return this.http.get<ArtifactSet[]>(this.apiBaseUrl);
  }

  getArtifact(slug: string): Observable<ArtifactSet> {
    return this.http.get<ArtifactSet>(`${this.apiBaseUrl}/${encodeURIComponent(slug)}`);
  }
}
