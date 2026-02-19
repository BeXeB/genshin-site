import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  // private genericMaterialUrl = 'assets/json/materials/generic-materials.json';
  // private bossMaterialUrl = 'assets/json/materials/boss-materials.json';
  // private weeklyMaterialUrl = 'assets/json/materials/weekly-materials.json';
  // private talentMaterialUrl = 'assets/json/materials/talent-materials.json';
  // private localSpecialtyUrl = 'assets/json/materials/local-specialties.json';
  // private eliteMaterialUrl = 'assets/json/materials/elite-materials.json';
  // private materialMapUrl = 'assets/json/material-rarity-map.json';

  // constructor(private http: HttpClient) {}

  // private genericMaterials$ = this.http
  //   .get<MaterialData[]>(this.genericMaterialUrl)
  //   .pipe(shareReplay(1));

  // private bossMaterials$ = this.http
  //   .get<MaterialData[]>(this.bossMaterialUrl)
  //   .pipe(shareReplay(1));

  // private weeklyMaterials$ = this.http
  //   .get<MaterialData[]>(this.weeklyMaterialUrl)
  //   .pipe(shareReplay(1));

  // private talentMaterials$ = this.http
  //   .get<MaterialData[]>(this.talentMaterialUrl)
  //   .pipe(shareReplay(1));

  // private localSpecialties$ = this.http
  //   .get<MaterialData[]>(this.localSpecialtyUrl)
  //   .pipe(shareReplay(1));

  // private eliteMaterials$ = this.http
  //   .get<MaterialData[]>(this.eliteMaterialUrl)
  //   .pipe(shareReplay(1));

  // private materialGroups$ = this.http
  //   .get<MaterialGroupsData>(this.materialMapUrl)
  //   .pipe(shareReplay(1));

  // getGenericMaterials(): Observable<Material[]> {
  //   return this.genericMaterials$.pipe(
  //     map((data) => data.map(Material.fromData)),
  //   );
  // }

  // getBossMaterials(): Observable<Material[]> {
  //   return this.bossMaterials$.pipe(map((data) => data.map(Material.fromData)));
  // }

  // getWeeklyMaterials(): Observable<Material[]> {
  //   return this.weeklyMaterials$.pipe(
  //     map((data) => data.map(Material.fromData)),
  //   );
  // }

  // getTalentMaterials(): Observable<Material[]> {
  //   return this.talentMaterials$.pipe(
  //     map((data) => data.map(Material.fromData)),
  //   );
  // }

  // getLocalSpecialties(): Observable<Material[]> {
  //   return this.localSpecialties$.pipe(
  //     map((data) => data.map(Material.fromData)),
  //   );
  // }

  // getEliteMaterials(): Observable<Material[]> {
  //   return this.eliteMaterials$.pipe(
  //     map((data) => data.map(Material.fromData)),
  //   );
  // }

  // getMaterialGroups(): Observable<MaterialGroups> {
  //   return combineLatest([this.materialGroups$, this.getMaterialMap()]).pipe(
  //     map(([groupsData, materialMap]) =>
  //       MaterialGroups.fromData(groupsData, materialMap),
  //     ),
  //   );
  // }

  // getMaterialMap(): Observable<Map<string, Material>> {
  //   return this.getAllMaterials().pipe(
  //     map((materials) => new Map(materials.map((m) => [m.id, m]))),
  //   );
  // }

  // getFamilyMap(): Observable<Map<string, MaterialFamily>> {
  //   return this.getMaterialGroups().pipe(
  //     map(groups => {
  //       const families = [
  //         ...groups.eliteMaterials,
  //         ...groups.genericMaterials,
  //         ...groups.talentMaterials
  //       ];
  //       return new Map(families.map(f => [f.id, f]));
  //     })
  //   );
  // }

  // getAllMaterials(): Observable<Material[]> {
  //   return combineLatest([
  //     this.getGenericMaterials(),
  //     this.getBossMaterials(),
  //     this.getWeeklyMaterials(),
  //     this.getTalentMaterials(),
  //     this.getLocalSpecialties(),
  //     this.getEliteMaterials(),
  //   ]).pipe(map((arrays) => arrays.flat()));
  // }

  // getGenericMaterialForItem(item: Character | Weapon): Observable<Material[]> {
  //   return this.getMaterialsForItem(
  //     'genericMaterials',
  //     this.getGenericMaterials(),
  //     item.genericMaterial.id,
  //   );
  // }

  // getEliteMaterialForItem(item: Weapon): Observable<Material[]> {
  //   return this.getMaterialsForItem(
  //     'eliteMaterials',
  //     this.getEliteMaterials(),
  //     item.eliteMaterial.id,
  //   );
  // }

  // getTalentMaterialForItem(item: Character): Observable<Material[]> {
  //   return this.getMaterialsForItem(
  //     'talentMaterials',
  //     this.getTalentMaterials(),
  //     item.talentMaterial.id,
  //   );
  // }

  // private getMaterialsForItem(
  //   groupKey: keyof MaterialGroupsData,
  //   materialList$: Observable<Material[]>,
  //   itemMaterialId: string,
  // ): Observable<Material[]> {
  //   return combineLatest([this.getMaterialGroups(), materialList$]).pipe(
  //     map(([groups, materials]) => {
  //       const family = groups[groupKey].find((f) => f.id === itemMaterialId);

  //       if (!family) return [];

  //       const rarities = Object.values(family.rarities)
  //         .filter((m): m is Material => !!m)
  //         .map(m => m.id);

  //       return materials.filter((m) => rarities.includes(m.id));
  //     }),
  //   );
  // }
}
