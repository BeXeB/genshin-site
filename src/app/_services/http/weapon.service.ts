import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeaponResolved } from '../../_models/weapons';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeaponService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/weapons`;

  constructor(private http: HttpClient) {}

  getWeapons(): Observable<WeaponResolved[]> {
    return this.http.get<WeaponResolved[]>(this.apiBaseUrl);
  }

  getWeapon(slug: string): Observable<WeaponResolved> {
    return this.http.get<WeaponResolved>(`${this.apiBaseUrl}/${encodeURIComponent(slug)}`);
  }
}
