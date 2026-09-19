import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tierlist } from '../_models/tierlist';

@Injectable({
  providedIn: 'root',
})
export class TierlistService {
  private tierlistUrl = 'assets/json/tierlist.json';

  constructor(private http: HttpClient) {}

  getTierlist(): Observable<Tierlist> {
    return this.http.get<Tierlist>(this.tierlistUrl);
  }

  getTierlistFromJson(jsonContent: string): Tierlist {
    return JSON.parse(jsonContent) as Tierlist;
  }
}
