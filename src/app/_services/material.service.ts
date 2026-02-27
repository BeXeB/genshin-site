import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, shareReplay, switchMap } from 'rxjs';
import { Material, MaterialCraft } from '../_models/materials';
import { MaterialType } from '../_models/enum';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private basePath = 'assets/json/materials/';

  constructor(private http: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    const folders: MaterialType[] = [
      MaterialType.TALENT_MATERIAL,
      MaterialType.BOSS_MATERIAL,
      MaterialType.GEMSTONE,
      MaterialType.LOCAL_SPECIALTY,
      MaterialType.WEAPON_MATERIAL,
      MaterialType.GENERIC_MATERIAL,
      MaterialType.XP_AND_MORA,
    ];

    const observables = folders.map((folder) =>
      this.http.get<Material[]>(`${this.basePath}${folder}/materials.json`),
    );

    return forkJoin(observables).pipe(map((arrays) => arrays.flat()));
  }

  getMaterialCrafts(): Observable<MaterialCraft[]> {
    return this.http.get<MaterialCraft[]>(`${this.basePath}crafts.json`);
  }
}
