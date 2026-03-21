import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Guide } from '../_models/guides';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuidesService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/guides`;

  constructor(private http: HttpClient) {}

  getGuides(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.apiBaseUrl);
  }

  /**
   * Fetch guide by slug
   * Returns the full guide object including markdown content
   */
  getGuide(slug: string): Observable<Guide> {
    return this.http.get<Guide>(`${this.apiBaseUrl}/${encodeURIComponent(slug)}`);
  }

  /**
   * Fetch guide markdown content by slug
   * Extracts the content field from the guide response
   */
  getGuideMarkdown(slug: string): Observable<string> {
    return this.getGuide(slug).pipe(
      map(guide => guide.content || '')
    );
  }

  /**
   * Fetch character guide markdown by character apikey
   * Uses the pattern: characters/{apiKey} or characters/traveler-{element}
   */
  getCharacterGuideMarkdown(apiKey: string): Observable<string> {
    return this.getGuideMarkdown(`characters/${apiKey}`);
  }
}
