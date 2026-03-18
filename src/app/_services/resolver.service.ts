import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaterialService } from './material.service';
import {
  Material,
  MaterialCraft,
  MaterialResolved,
} from '../_models/materials';
import { forkJoin, map, Observable, tap, of, catchError } from 'rxjs';
import { ResolvedItem, Item } from '../_models/items';
import {
  Character,
  CharacterBriefDescriptions,
  CharacterProfileResolved,
  CharacterResolved,
  CharacterTalentsResolved,
  CharacterVariantResolved,
} from '../_models/character';
import { Weapon, WeaponResolved } from '../_models/weapons';
import { ElementType } from '../_models/enum';

@Injectable({
  providedIn: 'root',
})
export class ResolverService {
  public materialMap = new Map<number, Material>();
  public craftMap = new Map<number, MaterialCraft>();

  private briefCache = new Map<string, CharacterBriefMap>();

  private initialized = false;
  private init$?: Observable<void>;

  constructor(
    private materialService: MaterialService,
    private http: HttpClient,
  ) {}

  initialize(): Observable<void> {
    if (this.initialized) {
      return of(void 0);
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

  private getBriefDescriptions(
    characterName: string,
  ): Observable<CharacterBriefMap> {
    const cached = this.briefCache.get(characterName);
    if (cached) {
      return of(cached);
    }

    return this.http
      .get<CharacterBriefMap>(
        `assets/json/briefdescription/${characterName}.json`,
      )
      .pipe(
        tap((briefMap) => {
          this.briefCache.set(characterName, briefMap);
        }),
        catchError(() => of({})),
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

  resolveCharacter(char: Character): Observable<CharacterResolved> {
    return this.getBriefDescriptions(char.profile.normalizedName).pipe(
      map((briefMap) => {
        const resolveCosts = <T extends { costs: Record<string, Item[]> }>(
          obj: T,
        ): T & { costs: Record<string, ResolvedItem[]> } => ({
          ...obj,
          costs: Object.fromEntries(
            Object.entries(obj.costs).map(([k, v]) => [
              k,
              this.resolveItems(v),
            ]),
          ) as any,
        });

        const resolvedProfile: CharacterProfileResolved = {
          ...char.profile,
          costs: Object.fromEntries(
            Object.entries(char.profile.costs).map(([k, v]) => [
              k,
              this.resolveItems(v),
            ]),
          ) as CharacterProfileResolved['costs'],
        };

        const resolvedSkills: CharacterTalentsResolved | undefined = char.skills
          ? resolveCosts(char.skills)
          : undefined;

        const resolvedVariants:
          | Partial<Record<ElementType, CharacterVariantResolved>>
          | undefined = char.variants
          ? Object.fromEntries(
              Object.entries(char.variants).map(([element, variant]) => {
                const resolvedVariant: CharacterVariantResolved = {
                  ...variant,
                  skills: resolveCosts(variant.skills),
                  brief:
                    (briefMap as CharacterBriefDescriptions).combat1 !==
                    undefined
                      ? undefined
                      : (
                          briefMap as Partial<
                            Record<ElementType, CharacterBriefDescriptions>
                          >
                        )[element as ElementType],
                };
                return [element, resolvedVariant];
              }),
            )
          : undefined;

        const resolved: CharacterResolved = {
          ...char,
          profile: resolvedProfile,
          skills: resolvedSkills,
          brief: briefMap as CharacterBriefDescriptions,
          variants: resolvedVariants,
        };

        return resolved;
      }),
    );
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

export type CharacterBriefMap =
  | CharacterBriefDescriptions
  | Partial<Record<ElementType, CharacterBriefDescriptions>>;
