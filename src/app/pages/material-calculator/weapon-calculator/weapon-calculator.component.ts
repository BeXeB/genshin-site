import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { combineLatest, map, shareReplay, take } from 'rxjs';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { MaterialCalculationService } from '../../../_services/material-calculation.service';
import { compareWeapons, HIDDEN_WEAPON_ID, WeaponService } from '../../../_services/weapon.service';
import { ImageService } from '../../../_services/image.service';
import {
  createDefaultWeaponProgress,
  LevelingCost,
  WeaponProgressEntry,
} from '../../../_models/calculator';
import { Weapon } from '../../../_models/weapons';
import { MaterialCostDisplayComponent } from '../material-cost-display/material-cost-display.component';
import {
  CharacterOption,
  CharacterSearchComponent,
} from '../../../_components/character-search/character-search.component';
import { SelectDropdownComponent } from '../../../_components/select-dropdown/select-dropdown.component';
import { buildLevelOptions, LEVEL_CAP_BY_ASCENSION } from '../level-options';

type WeaponRow = {
  progress: WeaponProgressEntry;
  weapon?: Weapon;
  name: string;
  iconUrl: string;
  levelOptions: (number | string)[];
};

/** Level dropdown options for each max ascension (index = ascension) */
const LEVEL_OPTIONS_BY_MAX_ASCENSION = LEVEL_CAP_BY_ASCENSION.map((cap) =>
  buildLevelOptions(cap),
);

/** Highest ascension with cost data; weapons below 4 stars stop at ascension 4 */
function getMaxAscension(weapon: Weapon): number {
  if (weapon.costs.ascend6) return 6;
  if (weapon.costs.ascend5) return 5;
  return 4;
}

@Component({
  selector: 'app-weapon-calculator',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialCostDisplayComponent,
    CharacterSearchComponent,
    SelectDropdownComponent,
  ],
  templateUrl: './weapon-calculator.component.html',
  styleUrls: [
    // Table styles shared with the character calculator
    '../material-calculator.component.css',
    './weapon-calculator.component.css',
  ],
})
export class WeaponCalculatorComponent {
  weapons$ = this.weaponService.getWeapons().pipe(shareReplay(1));
  inventory$ = this.calculatorState.inventory$;
  /** Weapon whose row is expanded */
  selectedWeapon: Weapon | null = null;
  calculatedCost: LevelingCost | null = null;

  /** Table rows for owned weapons, plus weapons that can still be added */
  view$ = combineLatest([this.weapons$, this.inventory$]).pipe(
    map(([weapons, inventory]) => {
      const byId = new Map(weapons.map((w) => [w.id, w] as const));
      return {
        rows: inventory.weapons.map((progress): WeaponRow => {
          const weapon = byId.get(progress.weaponId);
          return {
            progress,
            weapon,
            name: weapon?.name ?? 'Unknown',
            iconUrl: weapon ? this.imageService.getWeaponIcon(weapon.normalizedName) : '',
            levelOptions: LEVEL_OPTIONS_BY_MAX_ASCENSION[weapon ? getMaxAscension(weapon) : 6],
          };
        }),
        available: weapons
          .filter((w) => w.id !== HIDDEN_WEAPON_ID && !inventory.weapons.some((entry) => entry.weaponId === w.id))
          .sort(compareWeapons)
          .map((w) => this.toSearchOption(w)),
      };
    }),
  );

  constructor(
    private weaponService: WeaponService,
    private calculatorState: CalculatorStateService,
    private calculationService: MaterialCalculationService,
    private imageService: ImageService,
  ) {}

  /**
   * Add a weapon from the search; the option's characterId holds the weapon ID
   */
  onAddWeapon(option: CharacterOption): void {
    if (this.calculatorState.getWeapon(option.characterId)) {
      return;
    }
    this.weapons$.pipe(take(1)).subscribe((weapons) => {
      const weapon = weapons.find((w) => w.id === option.characterId);
      if (!weapon) {
        return;
      }
      this.calculatorState.addWeapon(
        createDefaultWeaponProgress(weapon.id, LEVEL_CAP_BY_ASCENSION[getMaxAscension(weapon)]),
      );
    });
  }

  /**
   * Remove a weapon from the inventory
   */
  onRemoveWeapon(weaponId: number): void {
    this.calculatorState.removeWeapon(weaponId);
    if (this.isExpanded(weaponId)) {
      this.clearSelection();
    }
  }

  /**
   * Expand a row to show its materials, or collapse it when already expanded
   */
  onRowClicked(row: WeaponRow): void {
    if (!row.weapon) {
      return;
    }
    if (this.isExpanded(row.progress.weaponId)) {
      this.clearSelection();
      return;
    }
    this.selectedWeapon = row.weapon;
    this.recalculateCost();
  }

  isExpanded(weaponId: number): boolean {
    return this.selectedWeapon?.id === weaponId;
  }

  /**
   * A current level above the goal raises the goal; a goal below the current level is clamped
   */
  onLevelChange(
    progress: WeaponProgressEntry,
    field: 'currentLevel' | 'goalLevel',
    value: string,
  ): void {
    const level = parseInt(value, 10);
    const updates: Partial<WeaponProgressEntry> =
      field === 'currentLevel'
        ? { currentLevel: level, goalLevel: Math.max(progress.goalLevel, level) }
        : { goalLevel: Math.max(progress.currentLevel, level) };
    this.onProgressUpdated(progress.weaponId, updates);
  }

  /**
   * Persist a progress change and refresh the expanded row's costs
   */
  private onProgressUpdated(
    weaponId: number,
    updates: Partial<WeaponProgressEntry>,
  ): void {
    this.calculatorState.updateWeaponProgress(weaponId, updates);
    if (this.isExpanded(weaponId)) {
      this.recalculateCost();
    }
  }

  private clearSelection(): void {
    this.selectedWeapon = null;
    this.calculatedCost = null;
  }

  /**
   * Recalculate material costs based on current progress
   */
  private recalculateCost(): void {
    const weapon = this.selectedWeapon;
    const progress = weapon ? this.calculatorState.getWeapon(weapon.id) : undefined;
    if (!weapon || !progress) {
      this.calculatedCost = null;
      return;
    }

    this.calculatedCost = this.calculationService.calculateWeaponTotalCost(
      weapon,
      progress.currentLevel,
      progress.goalLevel,
      progress.currentAscension,
      progress.goalAscension,
    );
  }

  /** The search option type is shared with characters, so the weapon ID is stored as characterId */
  private toSearchOption(weapon: Weapon): CharacterOption {
    return {
      characterId: weapon.id,
      name: weapon.name,
      normalizedName: weapon.normalizedName,
      iconUrl: this.imageService.getWeaponIcon(weapon.normalizedName),
    };
  }
}
