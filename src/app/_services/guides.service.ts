import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Guide } from '../_models/guides';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuidesService {
  private guideFiles = 'assets/guides';
  private guidesIndex = 'assets/json/guides.json';
  private guides$?: Observable<Guide[]>;
  private guideMarkdownByUrl = new Map<string, Observable<string>>();

  constructor(private http: HttpClient) {}

  getGuides(): Observable<Guide[]> {
    if (!this.guides$) {
      this.guides$ = this.http.get<Guide[]>(this.guidesIndex).pipe(shareReplay(1));
    }

    return this.guides$;
  }

  getGuideMarkdown(fileName: string): Observable<string> {
    return this.getCachedMarkdown(`${this.guideFiles}/${fileName}.md`);
  }

  /**
   * Fetch markdown content from a fileUrl
   * Useful for guides that have a fullpath in their fileUrl field
   */
  getGuideMarkdownByUrl(fileUrl: string): Observable<string> {
    return this.getCachedMarkdown(fileUrl);
  }

  private getCachedMarkdown(fileUrl: string): Observable<string> {
    let markdown$ = this.guideMarkdownByUrl.get(fileUrl);
    if (!markdown$) {
      markdown$ = this.http.get(fileUrl, { responseType: 'text' }).pipe(shareReplay(1));
      this.guideMarkdownByUrl.set(fileUrl, markdown$);
    }

    return markdown$;
  }

  /**
   * Fetch character guide markdown by character apikey
   */
  getCharacterGuideMarkdown(apiKey: string): Observable<string> {
    return this.getGuideMarkdown(`characters/${apiKey}`);
  }
}
