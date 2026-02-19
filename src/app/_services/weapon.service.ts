import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeaponService {
  private weaponUrl = 'assets/json/weapons.json'

  constructor(private http: HttpClient) { }

  // getWeapons(): Observable<WeaponData[]> {
  //   return this.http.get<WeaponData[]>(this.weaponUrl)
  // }
}
