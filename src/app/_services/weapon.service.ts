import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Weapon } from '../_models/weapons';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeaponService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/weapons`;

  constructor(private http: HttpClient) {}

  getWeapons(): Observable<Weapon[]> {
    return this.http.get<Weapon[]>(this.apiBaseUrl);
  }

  getWeapon(slug: string): Observable<Weapon> {
    return this.http.get<Weapon>(`${this.apiBaseUrl}/${encodeURIComponent(slug)}`);
  }
}
