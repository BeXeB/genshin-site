import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Guide } from '../../_models/guides';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuidesService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/guides`;
  private guidesPublicPath = `${environment.apiBaseUrl}/guides`;

  constructor(private http: HttpClient) {}

  getGuides(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.apiBaseUrl);
  }

  /**
   * Fetch guide by slug
   * Returns the full guide object including contentPath
   */
  getGuide(slug: string): Observable<Guide> {
    return this.http.get<Guide>(`${this.apiBaseUrl}/${encodeURIComponent(slug)}`);
  }

  /**
   * Fetch guide markdown content by slug
   * Reads the file from public/guides/{contentPath}
   */
  getGuideMarkdown(slug: string): Observable<string> {
    return this.getGuide(slug).pipe(
      switchMap(guide => {
        if (!guide.contentPath) {
          return of('');
        }
        const fileUrl = `${this.guidesPublicPath}/${guide.contentPath}`;
        return this.http.get(fileUrl, { responseType: 'text' });
      })
    );
  }

  /**
   * Fetch character guide markdown by character apikey
   * Fetches directly from public/guides/characters/{apiKey}.md
   * Does NOT require a database entry
   */
  getCharacterGuideMarkdown(apiKey: string): Observable<string> {
    const fileUrl = `${this.guidesPublicPath}/characters/${apiKey}.md`;
    return this.http.get(fileUrl, { responseType: 'text' });
  }
}
