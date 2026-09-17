import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { Weapon } from '../_models/weapons';

@Injectable({
  providedIn: 'root',
})
export class WeaponService {
  private basePath = 'assets/json/weapons';

  constructor(private http: HttpClient) {}

  getWeapons(): Observable<Weapon[]> {
    return this.http.get<string[]>(`${this.basePath}/index.json`).pipe(
      switchMap((names) => {
        if (!names || names.length === 0) {
          return of([] as Weapon[]);
        }

        const requests = names.map((name) =>
          this.http.get<Weapon>(`${this.basePath}/${name}.json`)
        );

        return forkJoin(requests);
      })
    );
  }

  getWeapon(slug: string): Observable<Weapon> {
    return this.http.get<Weapon>(`${this.basePath}/${slug}.json`);
  }
}
