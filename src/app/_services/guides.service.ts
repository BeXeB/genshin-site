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
    console.log(fileName);
    console.log(`${this.guideFiles}/${fileName}.md`);
    return this.http.get(`${this.guideFiles}/${fileName}.md`, {
      responseType: 'text',
    });
  }
}
