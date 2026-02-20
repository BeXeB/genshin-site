import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Character, CharacterProfile } from '../_models/character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private basePath = 'assets/json/characters/';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<CharacterProfile[]> {
    return this.http.get<CharacterProfile[]>(`${this.basePath}profiles.json`);
  }

  getCharacterNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.basePath}index.json`);
  }

  getCharacterDetails(name: string): Observable<Character> {
    name = name.replace(/\s+/g, '').toLowerCase();
    return this.http.get<Character>(`${this.basePath}${name}.json`);
  }
}
