import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, switchMap } from 'rxjs';
import {
  Character,
  CharacterConstellation,
  CharacterProfile,
  CharacterSkills,
  CharacterStats,
} from '../_models/character';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private characterNamesQuery: string =
    'https://genshin-db-api.vercel.app/api/v5/characters?query=names&matchCategories=true&resultLanguage=english';
  private characterQuery: string =
    'https://genshin-db-api.vercel.app/api/v5/characters?resultLanguage=english&query=';
  private characterSkillsQuery: string =
    'https://genshin-db-api.vercel.app/api/v5/talents?resultLanguage=english&query=';
  private characterStatsQuery: string =
    'https://genshin-db-api.vercel.app/api/v5/stats?folder=characters&resultLanguage=english&query=';
  private characterConstellationsQuery: string =
    'https://genshin-db-api.vercel.app/api/v5/constellations?resultLanguage=english&query=';

  constructor(private http: HttpClient) {}

  getCharacters(): Observable<CharacterProfile[]> {
    return this.http.get<string[]>(this.characterNamesQuery).pipe(
      switchMap((names) => {
        const requests: Observable<CharacterProfile>[] = names.map((name) => {
          name = name.replace(/\s+/g, '').toLowerCase();
          return this.http.get<CharacterProfile>(this.characterQuery + name);
        });

        return forkJoin(requests);
      }),
    );
  }

  getCharacterDetails(name: string): Observable<Character> {
    name = name.replace(/\s+/g, '').toLowerCase();

    return forkJoin({
      profile: this.http.get<CharacterProfile>(this.characterQuery + name),
      skills: this.http.get<CharacterSkills>(this.characterSkillsQuery + name),
      constellation: this.http.get<CharacterConstellation>(
        this.characterConstellationsQuery + name,
      ),
      stats: this.http.get<CharacterStats>(this.characterStatsQuery + name),
    });
  }
}
