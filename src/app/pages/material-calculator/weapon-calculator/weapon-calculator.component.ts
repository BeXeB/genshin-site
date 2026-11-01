import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ParamMap } from '@angular/router';
import { combineLatest, map, shareReplay, take } from 'rxjs';
import { compareWeapons, HIDDEN_WEAPON_ID, WeaponService } from '../../../_services/weapon.service';
import { createDefaultWeaponProgress, WeaponProgressEntry } from '../../../_models/calculator';
import { Weapon } from '../../../_models/weapons';
import {
  CharacterSearchComponent,
  SearchOption,
} from '../../../_components/character-search/character-search.component';
import { SelectDropdownComponent } from '../../../_components/select-dropdown/select-dropdown.component';
import { buildLevelOptions, getLevelUpdates, LEVEL_CAP_BY_ASCENSION } from '../level-options';
import { CalculatorTableBase, UNKNOWN_ENTRY_NAME } from '../calculator-table-base';
import { EntryRowComponent } from '../entry-row/entry-row.component';

type WeaponRow = {
  progress: WeaponProgressEntry;
  weapon?: Weapon;
  name: string;
  iconUrl: string;
  levelOptions: (number | string)[];
};

/** Level dropdown options for each max ascension (index = ascension) */
const LEVEL_OPTIONS_BY_MAX_ASCENSION = LEVEL_CAP_BY_ASCENSION.map((cap) => buildLevelOptions(cap));

/** Highest ascension level; used when a weapon is missing from the catalogue */
const MAX_ASCENSION = 6;

/** Highest ascension with cost data; weapons below 4 stars stop at ascension 4 */
function getMaxAscension(weapon: Weapon): number {
  if (weapon.costs.ascend6) return MAX_ASCENSION;
  if (weapon.costs.ascend5) return 5;
  return 4;
}

@Component({
  selector: 'app-weapon-calculator',
  standalone: true,
  imports: [CommonModule, CharacterSearchComponent, SelectDropdownComponent, EntryRowComponent],
  templateUrl: './weapon-calculator.component.html',
  styleUrls: ['../calculator-table.css', './weapon-calculator.component.css'],
})
export class WeaponCalculatorComponent extends CalculatorTableBase implements OnInit {
  private readonly weaponService = inject(WeaponService);
  private readonly weapons$ = this.weaponService.getWeapons().pipe(shareReplay(1));
  private readonly inventory$ = this.calculatorState.inventory$;
  /** Weapon whose row is expanded */
  private selectedWeapon: Weapon | null = null;

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
            name: weapon?.name ?? UNKNOWN_ENTRY_NAME,
            iconUrl: weapon ? this.imageService.getWeaponIcon(weapon.normalizedName) : '',
            levelOptions:
              LEVEL_OPTIONS_BY_MAX_ASCENSION[weapon ? getMaxAscension(weapon) : MAX_ASCENSION],
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
   * Add a weapon from the search
   */
  onAddWeapon(option: SearchOption): void {
    if (this.calculatorState.getWeapon(option.id)) {
      return;
    }
    this.weapons$.pipe(take(1)).subscribe((weapons) => {
      const weapon = weapons.find((w) => w.id === option.id);
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
      this.collapseRow();
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
      this.collapseRow();
      return;
    }
    this.selectedWeapon = row.weapon;
    this.recalculateCost();
    this.syncUrl({ weapon: row.weapon.normalizedName });
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

  protected clearSelection(): void {
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

  /** Options for the shared search; weapons use the same shape as characters */
  private toSearchOption(weapon: Weapon): SearchOption {
    return {
      id: weapon.id,
      name: weapon.name,
      normalizedName: weapon.normalizedName,
      iconUrl: this.imageService.getWeaponIcon(weapon.normalizedName),
    };
  }
}
