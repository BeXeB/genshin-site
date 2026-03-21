import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, shareReplay, catchError } from 'rxjs';
import { Material, MaterialResolved } from '../../_models/materials';
import { MaterialType } from '../../_models/enum';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private apiBaseUrl = `${environment.apiBaseUrl}/api/materials`;

  constructor(private http: HttpClient) {}

  private materials$?: Observable<Material[]>;

  /**
   * Get all materials (unresolved - for list views)
   */
  getMaterials(): Observable<Material[]> {
    if (!this.materials$) {
      this.materials$ = this.http.get<Material[]>(this.apiBaseUrl).pipe(
        shareReplay(1), // cache result
      );
    }
    return this.materials$;
  }

  /**
   * Get a single material by ID or normalized name with full resolution (includes craft recipes)
   */
  getMaterialResolved(idOrSlug: string | number): Observable<MaterialResolved> {
    return this.http.get<MaterialResolved>(`${this.apiBaseUrl}/${idOrSlug}`);
  }

  /**
   * Get a material by normalized name from the list (unresolved)
   */
  getMaterial(slug: string): Observable<Material | undefined> {
    return this.getMaterials().pipe(
      map((materials) => materials.find((m) => m.normalizedName === slug)),
    );
  }

  /**
   * Get a material by normalized name with full resolution (includes craft recipes)
   */
  getMaterialBySlugResolved(slug: string): Observable<MaterialResolved> {
    return this.getMaterialResolved(slug);
  }
}
