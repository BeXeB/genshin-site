import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
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
import { buildLevelOptions, getLevelUpdates, LEVEL_CAP_BY_ASCENSION } from '../level-options';
import { replaceQueryParams } from '../url-state';

type WeaponRow = {
  progress: WeaponProgressEntry;
  weapon?: Weapon;
  name: string;
  iconUrl: string;
  levelOptions: (number | string)[];
};

/** Level dropdown options for each max ascension (index = ascension) */
const LEVEL_OPTIONS_BY_MAX_ASCENSION = LEVEL_CAP_BY_ASCENSION.map((cap) => buildLevelOptions(cap));

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
    MaterialCostDisplayComponent,
    CharacterSearchComponent,
    SelectDropdownComponent,
  ],
  templateUrl: './weapon-calculator.component.html',
  styleUrls: ['../calculator-table.css', './weapon-calculator.component.css'],
})
export class WeaponCalculatorComponent implements OnInit {
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
          .filter(
            (w) =>
              w.id !== HIDDEN_WEAPON_ID &&
              !inventory.weapons.some((entry) => entry.weaponId === w.id)
          )
          .sort(compareWeapons)
          .map((w) => this.toSearchOption(w)),
      };
    })
  );

  constructor(
    private weaponService: WeaponService,
    private calculatorState: CalculatorStateService,
    private calculationService: MaterialCalculationService,
    private imageService: ImageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    // Restores the expanded row on load and on Back navigation
    combineLatest([this.route.queryParamMap, this.weapons$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, weapons]) => this.restoreSelection(params, weapons));
  }

  /**
   * Expands the weapon named in the URL, or collapses everything when the URL names none
   */
  private restoreSelection(params: ParamMap, weapons: Weapon[]): void {
    const weaponName = params.get('weapon');
    const weapon = weaponName ? weapons.find((w) => w.normalizedName === weaponName) : undefined;
    if (!weapon || !this.calculatorState.getWeapon(weapon.id)) {
      this.clearSelection();
    } else if (!this.isExpanded(weapon.id)) {
      this.selectedWeapon = weapon;
      this.recalculateCost();
    }
  }

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
        createDefaultWeaponProgress(weapon.id, LEVEL_CAP_BY_ASCENSION[getMaxAscension(weapon)])
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
      this.syncUrl({});
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
      this.syncUrl({});
      return;
    }
    this.selectedWeapon = row.weapon;
    this.recalculateCost();
    this.syncUrl({ weapon: row.weapon.normalizedName });
  }

  /** Writes the expanded row to the URL so Back returns to it */
  private syncUrl(params: Params): void {
    replaceQueryParams(this.router, this.location, this.route, params);
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
    value: string
  ): void {
    this.onProgressUpdated(progress.weaponId, getLevelUpdates(progress, field, value));
  }

  /**
   * Persist a progress change and refresh the expanded row's costs
   */
  private onProgressUpdated(weaponId: number, updates: Partial<WeaponProgressEntry>): void {
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
      progress.goalAscension
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
