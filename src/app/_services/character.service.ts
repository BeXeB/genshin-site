import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CharacterData } from '../_models/data/character';
import { Character } from '../_models/domain/character';
import { MaterialService } from './material.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private characterUrl = 'assets/json/characters.json';

  constructor(
    private http: HttpClient,
    private materialService: MaterialService,
  ) {}

  getCharacters(): Observable<Character[]> {
    return combineLatest([
      this.http.get<CharacterData[]>(this.characterUrl),
      this.materialService.getMaterialMap(),
      this.materialService.getFamilyMap(),
    ]).pipe(
      map(([characterData, materialMap, familyMap]) => {
        return characterData.map((cd) =>
          Character.fromData(cd, materialMap, familyMap),
        );
      }),
    );
  }
}
