import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Character, CharacterProfile } from '../_models/character';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/characters`;

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<CharacterProfile[]> {
    return this.http.get<CharacterProfile[]>(this.apiBaseUrl);
  }

  getCharacterNames(): Observable<string[]> {
    return this.http.get<CharacterProfile[]>(this.apiBaseUrl).pipe(
      map((characters) => characters.map((c) => c.normalizedName)),
    );
  }

  getCharacterDetails(name: string): Observable<Character> {
    // Normalize the name to match what the backend expects
    return this.http.get<Character>(`${this.apiBaseUrl}/${encodeURIComponent(name)}`);
  }
}
