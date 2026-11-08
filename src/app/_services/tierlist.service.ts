import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Tierlist } from '../_models/tierlist';

@Injectable({
  providedIn: 'root',
})
export class TierlistService {
  private tierlistUrl = 'assets/json/tierlist.json';
  private tierlist$?: Observable<Tierlist>;

  constructor(private http: HttpClient) {}

  getTierlist(): Observable<Tierlist> {
    if (!this.tierlist$) {
      this.tierlist$ = this.http.get<Tierlist>(this.tierlistUrl).pipe(shareReplay(1));
    }

    return this.tierlist$;
  }

  getTierlistFromJson(jsonContent: string): Tierlist {
    return JSON.parse(jsonContent) as Tierlist;
  }
}
