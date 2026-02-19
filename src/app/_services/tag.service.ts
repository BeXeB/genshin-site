import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TagDefinition } from '../_models/tierlist';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private tagsUrl = 'assets/json/tags.json'

  constructor(private http: HttpClient) { }


  getTags(): Observable<TagDefinition[]> {
    return this.http.get<TagDefinition[]>(this.tagsUrl);
  }
}
