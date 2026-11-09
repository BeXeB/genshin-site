import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ArtifactSet } from '../_models/artifacts';

@Injectable({
  providedIn: 'root',
})
export class ArtifactService {
  private basePath = 'assets/json/artifacts';
  private artifacts$?: Observable<ArtifactSet[]>;
  private artifactsBySlug = new Map<string, Observable<ArtifactSet>>();

  constructor(private http: HttpClient) {}

  getArtifacts(): Observable<ArtifactSet[]> {
    if (!this.artifacts$) {
      this.artifacts$ = this.http.get<string[]>(`${this.basePath}/index.json`).pipe(
        switchMap((names) => {
          if (!names || names.length === 0) {
            return of([] as ArtifactSet[]);
          }

          const requests = names.map((name) => this.getArtifact(name));

          return forkJoin(requests);
        }),
        shareReplay(1)
      );
    }

    return this.artifacts$;
  }

  getArtifact(slug: string): Observable<ArtifactSet> {
    let artifact$ = this.artifactsBySlug.get(slug);
    if (!artifact$) {
      artifact$ = this.http.get<ArtifactSet>(`${this.basePath}/${slug}.json`).pipe(shareReplay(1));
      this.artifactsBySlug.set(slug, artifact$);
    }

    return artifact$;
  }
}
