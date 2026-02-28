import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { ArtifactSet } from '../_models/artifacts';

@Injectable({
  providedIn: 'root',
})
export class ArtifactService {
  private basePath = 'assets/json/artifacts';

  constructor(private http: HttpClient) {}

  getArtifacts(): Observable<ArtifactSet[]> {
    return this.http.get<string[]>(`${this.basePath}/index.json`).pipe(
      switchMap((names) => {
        if (!names || names.length === 0) {
          return of([] as ArtifactSet[]);
        }

        const requests = names.map((name) =>
          this.http.get<ArtifactSet>(`${this.basePath}/${name}.json`),
        );

        return forkJoin(requests);
      }),
    );
  }

  getArtifact(slug: string): Observable<ArtifactSet> {
    return this.http.get<ArtifactSet>(`${this.basePath}/${slug}.json`);
  }
}
