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

  private materials$?: Observable<Material[]>;

  getMaterials(): Observable<Material[]> {
    if (!this.materials$) {
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

      this.materials$ = forkJoin(observables).pipe(
        map((arrays) => arrays.flat()),
        shareReplay(1), // cache result
      );
    }
    return this.materials$;
  }

  getMaterialCrafts(): Observable<MaterialCraft[]> {
    return this.http.get<MaterialCraft[]>(`${this.basePath}crafts.json`);
  }

  getMaterial(slug: string): Observable<Material | undefined> {
    return this.getMaterials().pipe(
      map((materials) => materials.find((m) => m.normalizedName === slug)),
    );
  }
}
