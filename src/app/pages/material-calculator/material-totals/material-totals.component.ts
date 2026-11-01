import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { CharacterService } from '../../../_services/character.service';
import { MaterialCalculationService } from '../../../_services/material-calculation.service';
import { WeaponService } from '../../../_services/weapon.service';
import {
  CharacterProgressEntry,
  includesSharedLeveling,
  LevelingCost,
  WeaponProgressEntry,
} from '../../../_models/calculator';
import { CharacterProfile } from '../../../_models/character';
import { Weapon } from '../../../_models/weapons';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';

const EMPTY_COST: LevelingCost = { materials: [], totalMora: 0 };

@Component({
  selector: 'app-material-totals',
  standalone: true,
  imports: [CommonModule, MaterialCostDisplayComponent],
  templateUrl: './material-totals.component.html',
  styleUrls: ['../calculator-table.css'],
})
export class MaterialTotalsComponent {
  /** Materials still needed across every tracked character and weapon */
  view$ = combineLatest([
    this.characterService.getCharacters(),
    this.weaponService.getWeapons(),
    this.calculatorState.inventory$,
  ]).pipe(
    switchMap(([characters, weapons, inventory]) => {
      const entryCosts = [
        ...inventory.characters.map((entry) =>
          this.getCharacterCost(
            entry,
            characters,
            includesSharedLeveling(entry, inventory.characters)
          )
        ),
        ...inventory.weapons.map((entry) => of(this.getWeaponCost(entry, weapons))),
      ];
      const costs$ = entryCosts.length ? forkJoin(entryCosts) : of<LevelingCost[]>([]);
      return costs$.pipe(
        map((costs) => ({
          isEmpty: entryCosts.length === 0,
          cost: this.calculationService.mergeCosts(...costs),
          ownedMaterials: inventory.ownedMaterials,
        }))
      );
    })
  );

  constructor(
    private characterService: CharacterService,
    private weaponService: WeaponService,
    private calculatorState: CalculatorStateService,
    private calculationService: MaterialCalculationService
  ) {}

  /** Falls back to leveling and ascension only when the character details fail to load */
  private getCharacterCost(
    entry: CharacterProgressEntry,
    characters: CharacterProfile[],
    includeLeveling: boolean
  ): Observable<LevelingCost> {
    const character = characters.find((c) => c.id === entry.characterId);
    if (!character) {
      return of(EMPTY_COST);
    }
    return this.characterService.getCharacterDetails(character.normalizedName).pipe(
      catchError(() => of({ profile: character })),
      map((details) =>
        this.calculationService.calculateCharacterEntryCost(details, entry, includeLeveling)
      )
    );
  }

  private getWeaponCost(entry: WeaponProgressEntry, weapons: Weapon[]): LevelingCost {
    const weapon = weapons.find((w) => w.id === entry.weaponId);
    if (!weapon) {
      return EMPTY_COST;
    }
    return this.calculationService.calculateWeaponTotalCost(
      weapon,
      entry.currentLevel,
      entry.goalLevel,
      entry.currentAscension,
      entry.goalAscension
    );
  }
}
