import { Injectable } from '@angular/core';
import { MaterialService } from './material.service';
import { CharacterService } from './character.service';
import { WeaponService } from './weapon.service';
import {
  Material,
  MaterialCraft,
  MaterialResolved,
} from '../_models/materials';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { ResolvedItem, Item } from '../_models/items';
import {
  Character,
  CharacterProfileResolved,
  CharacterResolved,
  CharacterTalentsResolved,
} from '../_models/character';
import { Weapon, WeaponResolved } from '../_models/weapons';

@Injectable({
  providedIn: 'root',
})
export class ResolverService {
  public materialMap = new Map<number, Material>();
  public craftMap = new Map<number, MaterialCraft>();
  private initialized = false;
  private init$?: Observable<void>;

  constructor(private materialService: MaterialService) {}

  initialize(): Observable<void> {
    if (this.initialized) {
      return new Observable((observer) => {
        observer.next();
        observer.complete();
      });
    }

    if (!this.init$) {
      this.init$ = forkJoin({
        materials: this.materialService.getMaterials(),
        crafts: this.materialService.getMaterialCrafts(),
      }).pipe(
        tap(({ materials, crafts }) => {
          materials.forEach((m) => this.materialMap.set(m.id, m));
          crafts.forEach((c) => this.craftMap.set(c.id, c));
          this.initialized = true;
        }),
        map(() => void 0),
      );
    }

    return this.init$;
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

  resolveMaterial(material: Material): MaterialResolved {
    const resolvedMaterial = this.materialMap.get(material.id) ?? material;

    const craftData = this.craftMap.get(material.id);

    const craft = craftData
      ? {
          recipe: craftData.recipe.map((r) =>
            this.resolveItem({ id: r.id, name: r.name, count: r.count }),
          ),
          moraCost: craftData?.moraCost,
          resultCount: craftData?.resultCount,
        }
      : undefined;

    return {
      ...resolvedMaterial,
      craftable: !!craftData,
      craft,
    };
  }

  resolveMaterials(materials: Material[]): MaterialResolved[] {
    return materials.map((m) => this.resolveMaterial(m));
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

  resolveWeapon(weapon: Weapon): WeaponResolved {
    return {
      ...weapon,
      costs: Object.fromEntries(
        Object.entries(weapon.costs).map(([k, v]) => [k, this.resolveItems(v)]),
      ) as WeaponResolved['costs'],
    };
  }

  resolveWeapons(weapons: Weapon[]): WeaponResolved[] {
    return weapons.map((w) => this.resolveWeapon(w));
  }
}
