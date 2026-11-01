import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { CharacterService } from '../../../_services/character.service';
import { MaterialCalculationService } from '../../../_services/material-calculation.service';
import { MaterialService } from '../../../_services/material.service';
import { WeaponService } from '../../../_services/weapon.service';
import {
  CalculatorInventory,
  CharacterProgressEntry,
  getCraftsNeeded,
  includesSharedLeveling,
  LevelingCost,
  MaterialTotal,
  WeaponProgressEntry,
} from '../../../_models/calculator';
import { CharacterProfile } from '../../../_models/character';
import { MaterialCraft } from '../../../_models/materials';
import { Weapon } from '../../../_models/weapons';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';

const EMPTY_COST: LevelingCost = { materials: [], totalMora: 0 };

/** Materials and Mora for every craft the tracked craftables still need */
function getCraftCost(crafts: MaterialCraft[], inventory: CalculatorInventory): LevelingCost {
  const craftById = new Map(crafts.map((craft) => [craft.id, craft] as const));
  const materials = new Map<number, MaterialTotal>();
  let totalMora = 0;
  for (const progress of inventory.craftables ?? []) {
    const craft = craftById.get(progress.weaponId);
    const craftCount = getCraftsNeeded(progress);
    if (!craft || craftCount === 0) {
      continue;
    }
    totalMora += craft.moraCost * craftCount;
    for (const item of craft.recipe) {
      const total = materials.get(item.id) ?? {
        materialId: item.id,
        materialName: item.name,
        quantity: 0,
      };
      total.quantity += item.count * craftCount;
      materials.set(item.id, total);
    }
  }
  return { materials: [...materials.values()], totalMora };
}

@Component({
  selector: 'app-material-totals',
  standalone: true,
  imports: [CommonModule, MaterialCostDisplayComponent],
  templateUrl: './material-totals.component.html',
  styleUrls: ['../calculator-table.css'],
})
export class MaterialTotalsComponent {
  /** Materials still needed across every tracked character and weapon */
  /** Materials still needed across every tracked character, weapon and craft (craft Mora included) */
  view$ = combineLatest([
    this.characterService.getCharacters(),
    this.weaponService.getWeapons(),
    this.calculatorState.inventory$,
    this.materialService.getMaterialCrafts(),
  ]).pipe(
    switchMap(([characters, weapons, inventory, crafts]) => {
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
      const craftMora = getCraftCost(crafts, inventory).totalMora;
      const costs$ = entryCosts.length ? forkJoin(entryCosts) : of<LevelingCost[]>([]);
      return costs$.pipe(
        map((costs) => ({
          isEmpty: entryCosts.length === 0 && craftMora === 0,
          cost: this.calculationService.mergeCosts(
            ...costs,
            { materials: [], totalMora: craftMora }
          ),
          ownedMaterials: inventory.ownedMaterials,
        }))
      );
    })
  );

  /** Billets and ores still needed by the tracked craftable weapons */
  craftCost$ = combineLatest([
    this.materialService.getMaterialCrafts(),
    this.calculatorState.inventory$,
  ]).pipe(
    map(([crafts, inventory]) => ({
      cost: { materials: getCraftCost(crafts, inventory).materials, totalMora: 0 },
      ownedMaterials: inventory.ownedMaterials,
    }))
  );

  constructor(
    private characterService: CharacterService,
    private weaponService: WeaponService,
    private materialService: MaterialService,
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
