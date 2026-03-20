import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Guide } from '../_models/guides';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuidesService {
  private guideFiles = 'assets/guides';
  private guidesIndex = 'assets/json/guides.json';

  constructor(private http: HttpClient) {}

  getGuides(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.guidesIndex);
  }

  getGuideMarkdown(fileName: string): Observable<string> {
    return this.http.get(`${this.guideFiles}/${fileName}.md`, {
      responseType: 'text',
    });
  }

  /**
   * Fetch markdown content from a fileUrl
   * Useful for guides that have a fullpath in their fileUrl field
   */
  getGuideMarkdownByUrl(fileUrl: string): Observable<string> {
    return this.http.get(fileUrl, {
      responseType: 'text',
    });
  }

  /**
   * Fetch character guide markdown by character apikey
   */
  getCharacterGuideMarkdown(apiKey: string): Observable<string> {
    return this.getGuideMarkdown(`characters/${apiKey}`);
  }
}
