import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, of, shareReplay, catchError } from 'rxjs';
import { Material, MaterialCraft } from '../_models/materials';
import { MaterialType } from '../_models/enum';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/materials`;

  constructor(private http: HttpClient) {}

  private materials$?: Observable<Material[]>;

  getMaterials(): Observable<Material[]> {
    if (!this.materials$) {
      this.materials$ = this.http.get<Material[]>(this.apiBaseUrl).pipe(
        shareReplay(1), // cache result
      );
    }
    return this.materials$;
  }

  getMaterialCrafts(): Observable<MaterialCraft[]> {
    // The backend doesn't have a separate crafts endpoint.
    // Crafts are embedded in the material data.
    // Return an empty array for now to maintain backward compatibility.
    // The resolver service can extract crafts from individual materials if needed.
    return of([]);
  }

  getMaterial(slug: string): Observable<Material | undefined> {
    return this.getMaterials().pipe(
      map((materials) => materials.find((m) => m.normalizedName === slug)),
    );
  }
}
