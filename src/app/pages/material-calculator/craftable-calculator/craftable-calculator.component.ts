import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map, shareReplay } from 'rxjs';
import {
  CraftableProgressEntry,
  createDefaultCraftableProgress,
  getRefineUpdates,
  MAX_REFINE,
} from '../../../_models/calculator';
import { MaterialType } from '../../../_models/enum';
import { Weapon } from '../../../_models/weapons';
import { CalculatorStateService } from '../../../_services/calculator-state.service';
import { ImageService } from '../../../_services/image.service';
import { MaterialService } from '../../../_services/material.service';
import { compareWeapons, WeaponService } from '../../../_services/weapon.service';
import { SelectDropdownComponent } from '../../../_components/select-dropdown/select-dropdown.component';
import {
  CharacterSearchComponent,
  SearchOption,
} from '../../../_components/character-search/character-search.component';
import { EntryRowComponent } from '../entry-row/entry-row.component';

/** A weapon that can be forged from billets, with the billet cost of one craft */
type CraftableWeapon = {
  weapon: Weapon;
  billetId: number;
  billetName: string;
  billetsPerCraft: number;
};

type CraftableRow = CraftableWeapon & {
  iconUrl: string;
  progress: CraftableProgressEntry;
};

const REFINE_OPTIONS: number[] = Array.from({ length: MAX_REFINE + 1 }, (_, i) => i);

@Component({
  selector: 'app-craftable-calculator',
  standalone: true,
  imports: [CommonModule, CharacterSearchComponent, SelectDropdownComponent, EntryRowComponent],
  templateUrl: './craftable-calculator.component.html',
  styleUrls: ['../calculator-table.css', './craftable-calculator.component.css'],
})
export class CraftableCalculatorComponent {
  private readonly calculatorState = inject(CalculatorStateService);
  private readonly materialService = inject(MaterialService);
  private readonly weaponService = inject(WeaponService);
  private readonly imageService = inject(ImageService);

  /** Weapons with a billet recipe in the crafts export, sorted like the weapon list */
  private readonly craftables$ = combineLatest([
    this.materialService.getMaterialCrafts(),
    this.materialService.getMaterials(),
    this.weaponService.getWeapons(),
  ]).pipe(
    map(([crafts, materials, weapons]): CraftableWeapon[] => {
      const billetIds = new Set(
        materials.filter((m) => m.type === MaterialType.BILLET).map((m) => m.id)
      );
      const weaponById = new Map(weapons.map((w) => [w.id, w] as const));
      return crafts
        .flatMap((craft): CraftableWeapon[] => {
          const weapon = weaponById.get(craft.id);
          const billet = craft.recipe.find((item) => billetIds.has(item.id));
          return weapon && billet
            ? [
                {
                  weapon,
                  billetId: billet.id,
                  billetName: billet.name,
                  billetsPerCraft: billet.count,
                },
              ]
            : [];
        })
        .sort((a, b) => compareWeapons(a.weapon, b.weapon));
    }),
    shareReplay(1)
  );

  /** Table rows for tracked craftables, plus craftable weapons that can still be added */
  view$ = combineLatest([this.craftables$, this.calculatorState.inventory$]).pipe(
    map(([craftables, inventory]) => {
      const byId = new Map(craftables.map((c) => [c.weapon.id, c] as const));
      const tracked = inventory.craftables ?? [];

      const rows = tracked.flatMap((progress): CraftableRow[] => {
        const entry = byId.get(progress.weaponId);
        if (!entry) {
          return [];
        }
        return [
          {
            ...entry,
            iconUrl: this.imageService.getWeaponIcon(entry.weapon.normalizedName),
            progress,
          },
        ];
      });

      return {
        rows,
        refineOptions: REFINE_OPTIONS,
        available: craftables
          .filter((c) => !tracked.some((t) => t.weaponId === c.weapon.id))
          .map((c) => this.toSearchOption(c.weapon)),
      };
    })
  );

  /** Start tracking a craftable weapon from the search */
  onAddCraftable(option: SearchOption): void {
    this.calculatorState.addCraftable(createDefaultCraftableProgress(option.id));
  }

  onRemoveCraftable(weaponId: number): void {
    this.calculatorState.removeCraftable(weaponId);
  }

  /** Saves a refine change; the value arrives as a string from the dropdown */
  onRefineChange(
    progress: CraftableProgressEntry,
    field: 'currentRefine' | 'goalRefine',
    value: string
  ): void {
    this.calculatorState.updateCraftableProgress(
      progress.weaponId,
      getRefineUpdates(progress, field, value)
    );
  }

  private toSearchOption(weapon: Weapon): SearchOption {
    return {
      id: weapon.id,
      name: weapon.name,
      normalizedName: weapon.normalizedName,
      iconUrl: this.imageService.getWeaponIcon(weapon.normalizedName),
    };
  }
}
