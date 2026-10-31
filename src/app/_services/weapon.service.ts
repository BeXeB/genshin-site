import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Weapon } from '../_models/weapons';

export const HIDDEN_WEAPON_ID = 11419;

/** Weapon list order: rarity (high to low), weapon type (A-Z), then sortOrder (high to low) */
export function compareWeapons(
  a: Pick<Weapon, 'rarity' | 'weaponType' | 'sortOrder'>,
  b: Pick<Weapon, 'rarity' | 'weaponType' | 'sortOrder'>,
): number {
  if (a.rarity !== b.rarity) return b.rarity - a.rarity;
  if (a.weaponType !== b.weaponType) return a.weaponType.localeCompare(b.weaponType);
  return b.sortOrder - a.sortOrder;
}

@Injectable({
  providedIn: 'root',
})
export class WeaponService {
  private basePath = 'assets/json/weapons';
  private weapons$?: Observable<Weapon[]>;

  constructor(private http: HttpClient) {}

  getWeapons(): Observable<Weapon[]> {
    if (!this.weapons$) {
      this.weapons$ = this.http.get<string[]>(`${this.basePath}/index.json`).pipe(
        switchMap((names) => {
          if (!names || names.length === 0) {
            return of([] as Weapon[]);
          }

          const requests = names.map((name) =>
            this.http.get<Weapon>(`${this.basePath}/${name}.json`)
          );

          return forkJoin(requests);
        }),
        shareReplay(1)
      );
    }
    return this.weapons$;
  }

  getWeapon(slug: string): Observable<Weapon> {
    return this.http.get<Weapon>(`${this.basePath}/${slug}.json`);
  }
}
