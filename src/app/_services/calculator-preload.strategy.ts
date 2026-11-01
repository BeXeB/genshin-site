import { inject, Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CharacterProfile } from '../_models/character';
import { CalculatorStateService } from './calculator-state.service';
import { CharacterService } from './character.service';
import { MaterialService } from './material.service';
import { WeaponService } from './weapon.service';

/**
 * Preloads routes marked with `data: { preloadCalculator: true }`, together with the
 * data the material calculator pages read, so switching between its tabs is instant.
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorPreloadStrategy implements PreloadingStrategy {
  private materialService = inject(MaterialService);
  private weaponService = inject(WeaponService);
  private characterService = inject(CharacterService);
  private calculatorState = inject(CalculatorStateService);

  private dataRequested = false;

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preloadCalculator'] !== true) {
      return of(null);
    }
    this.requestSharedData();
    return load();
  }

  /** Warms the shared caches once. Errors are ignored here; the pages report them on visit. */
  private requestSharedData(): void {
    if (this.dataRequested) {
      return;
    }
    this.dataRequested = true;

    this.materialService.getMaterials().subscribe({ error: () => {} });
    this.materialService.getMaterialCrafts().subscribe({ error: () => {} });
    this.weaponService.getWeapons().subscribe({ error: () => {} });
    this.characterService.getCharacters().subscribe({
      next: (profiles) => this.preloadOwnedCharacters(profiles),
      error: () => {},
    });
  }

  private preloadOwnedCharacters(profiles: CharacterProfile[]): void {
    for (const entry of this.calculatorState.getCurrentInventory().characters) {
      const profile = profiles.find((p) => p.id === entry.characterId);
      if (profile) {
        this.characterService
          .getCharacterDetails(profile.normalizedName)
          .subscribe({ error: () => {} });
      }
    }
  }
}
