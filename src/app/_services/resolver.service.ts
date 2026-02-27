import { Injectable } from '@angular/core';
import { MaterialService } from './material.service';
import { CharacterService } from './character.service';
import { WeaponService } from './weapon.service';
import { Material, MaterialCraft } from '../_models/materials';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { ResolvedItem, Item } from '../_models/items';
import {
  Character,
  CharacterProfileResolved,
  CharacterResolved,
  CharacterTalentsResolved,
} from '../_models/character';

@Injectable({
  providedIn: 'root',
})
export class ResolverService {
  public materialMap = new Map<number, Material>();
  public craftMap = new Map<number, MaterialCraft>();

  constructor(
    private materialService: MaterialService,
    private characterService: CharacterService,
    private weaponService: WeaponService,
  ) {}

  initialize(): Observable<void> {
    return forkJoin({
      materials: this.materialService.getMaterials(),
      crafts: this.materialService.getMaterialCrafts(),
    }).pipe(
      tap(({ materials, crafts }) => {
        materials.forEach((m) => this.materialMap.set(m.id, m));
        crafts.forEach((c) => this.craftMap.set(c.id, c));
      }),
      map(() => void 0),
    );
  }

  resolveItems(items: Item[]): ResolvedItem[] {
    return items.map((i) => this.resolveItem(i));
  }

  resolveItem(item: Item): ResolvedItem {
    const material = this.materialMap.get(item.id)!;
    const craftData = this.craftMap.get(item.id);

    let craft: ResolvedItem['craft'] | undefined = undefined;

    if (craftData) {
      craft = {
        moraCost: craftData.moraCost,
        resultCount: craftData.resultCount,
        recipe: craftData.recipe.map((r) =>
          this.resolveItem({ id: r.id, name: r.name, count: r.count }),
        ),
      };
    }

    return {
      material,
      count: item.count,
      craftable: !!craftData,
      craft,
    };
  }

  resolveCharacter(char: Character): CharacterResolved {
    return {
      ...char,
      profile: {
        ...char.profile,
        costs: Object.fromEntries(
          Object.entries(char.profile.costs).map(([k, v]) => [
            k,
            this.resolveItems(v),
          ]),
        ) as CharacterProfileResolved['costs'],
      },
      skills: char.skills
        ? {
            ...char.skills,
            costs: Object.fromEntries(
              Object.entries(char.skills.costs).map(([k, v]) => [
                k,
                this.resolveItems(v),
              ]),
            ) as CharacterTalentsResolved['costs'],
          }
        : undefined,
    };
  }
}
