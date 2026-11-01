import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AETHER_ID,
  CalculatorInventory,
  CharacterEntryKey,
  CharacterProgressEntry,
  CraftableProgressEntry,
  createInstanceId,
  TRAVELER_ID,
  WeaponProgressEntry,
  isSameEntry,
} from '../_models/calculator';
import { CalculatorStorageService } from './calculator-storage.service';

const EMPTY_INVENTORY: CalculatorInventory = {
  characters: [],
  weapons: [],
  ownedMaterials: {},
};

/** Gives weapon and craftable entries saved before instance IDs existed one each */
function assignInstanceIds(inventory: CalculatorInventory): CalculatorInventory {
  return {
    ...inventory,
    weapons: inventory.weapons.map((w) =>
      w.instanceId ? w : { ...w, instanceId: createInstanceId() }
    ),
    craftables: inventory.craftables?.map((c) =>
      c.instanceId ? c : { ...c, instanceId: createInstanceId() }
    ),
  };
}

/** Copies the Traveler's shared level and ascensions; talents stay per element */
function withSharedLevel(
  entry: CharacterProgressEntry,
  source: CharacterProgressEntry
): CharacterProgressEntry {
  return {
    ...entry,
    currentLevel: source.currentLevel,
    goalLevel: source.goalLevel,
    currentAscension: source.currentAscension,
    goalAscension: source.goalAscension,
  };
}

/** Maps saved Aether entries onto the merged Traveler, keeping one entry per element */
function mergeTravelerEntries(inventory: CalculatorInventory): CalculatorInventory {
  const characters: CharacterProgressEntry[] = [];
  for (const entry of inventory.characters) {
    const migrated =
      entry.characterId === AETHER_ID ? { ...entry, characterId: TRAVELER_ID } : entry;
    if (!characters.some((c) => isSameEntry(c, migrated))) {
      characters.push(migrated);
    }
  }
  const shared = characters.find((c) => c.characterId === TRAVELER_ID);
  return {
    ...inventory,
    characters: shared
      ? characters.map((c) => (c.characterId === TRAVELER_ID ? withSharedLevel(c, shared) : c))
      : characters,
  };
}

@Injectable({
  providedIn: 'root',
})
export class CalculatorStateService {
  private inventorySubject = new BehaviorSubject<CalculatorInventory>(EMPTY_INVENTORY);
  public inventory$ = this.inventorySubject.asObservable();

  constructor(private storageService: CalculatorStorageService) {
    this.loadInventory();
  }

  /**
   * Load inventory from storage
   */
  private loadInventory(): void {
    const stored = this.storageService.loadInventory();
    if (stored) {
      this.inventorySubject.next(assignInstanceIds(mergeTravelerEntries(stored)));
    }
  }

  /**
   * Get current inventory synchronously
   */
  getCurrentInventory(): CalculatorInventory {
    return this.inventorySubject.value;
  }

  /**
   * Calculate ascension phase from level
   * Phases: 0 (1-20), 1 (21-40), 2 (41-50), 3 (51-60), 4 (61-70), 5 (71-80), 6 (81-90)
   * Ascension caps at: 20, 40, 50, 60, 70, 80, 90
   */
  private getAscensionFromLevel(level: number): number {
    if (level <= 20) return 0;
    if (level <= 40) return 1;
    if (level <= 50) return 2;
    if (level <= 60) return 3;
    if (level <= 70) return 4;
    if (level <= 80) return 5;
    return 6;
  }

  /**
   * Add a character to the inventory
   */
  addCharacter(characterEntry: CharacterProgressEntry): void {
    const current = this.getCurrentInventory();
    // Avoid duplicates
    if (current.characters.some((c) => isSameEntry(c, characterEntry))) {
      console.warn(`Character with ID ${characterEntry.characterId} already in inventory`);
      return;
    }
    const sharedTraveler = current.characters.find((c) => c.characterId === TRAVELER_ID);
    const joining =
      characterEntry.characterId === TRAVELER_ID && sharedTraveler
        ? withSharedLevel(characterEntry, sharedTraveler)
        : characterEntry;
    // Automatically calculate ascensions based on levels
    const entryWithAscensions: CharacterProgressEntry = {
      ...joining,
      currentAscension: this.getAscensionFromLevel(joining.currentLevel),
      goalAscension: this.getAscensionFromLevel(joining.goalLevel),
    };
    const updated: CalculatorInventory = {
      ...current,
      characters: [...current.characters, entryWithAscensions],
    };
    this.updateInventory(updated);
  }

  /**
   * Remove a character from inventory
   */
  removeCharacter(entry: CharacterEntryKey): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      characters: current.characters.filter((c) => !isSameEntry(c, entry)),
    };
    this.updateInventory(updated);
  }

  /**
   * Update a character's progress
   */
  updateCharacterProgress(
    entry: CharacterEntryKey,
    updates: Partial<CharacterProgressEntry>
  ): void {
    const current = this.getCurrentInventory();
    const characters: CharacterProgressEntry[] = current.characters.map((c) => {
      if (isSameEntry(c, entry)) {
        const merged = { ...c, ...updates };
        // Automatically calculate ascensions from levels
        return {
          ...merged,
          currentAscension: this.getAscensionFromLevel(merged.currentLevel),
          goalAscension: this.getAscensionFromLevel(merged.goalLevel),
        };
      }
      return c;
    });
    const edited = characters.find((c) => isSameEntry(c, entry));
    const updated: CalculatorInventory = {
      ...current,
      characters:
        edited && edited.characterId === TRAVELER_ID
          ? characters.map((c) => (c.characterId === TRAVELER_ID ? withSharedLevel(c, edited) : c))
          : characters,
    };
    this.updateInventory(updated);
  }

  /**
   * Get a specific character from inventory
   */
  getCharacter(entry: CharacterEntryKey): CharacterProgressEntry | undefined {
    return this.getCurrentInventory().characters.find((c) => isSameEntry(c, entry));
  }

  /**
   * Add a weapon to the inventory; the same weapon can be added more than once
   */
  addWeapon(weaponEntry: WeaponProgressEntry): void {
    const current = this.getCurrentInventory();
    // Automatically calculate ascensions based on levels
    const entryWithAscensions: WeaponProgressEntry = {
      ...weaponEntry,
      currentAscension: this.getAscensionFromLevel(weaponEntry.currentLevel),
      goalAscension: this.getAscensionFromLevel(weaponEntry.goalLevel),
    };
    const updated: CalculatorInventory = {
      ...current,
      weapons: [...current.weapons, entryWithAscensions],
    };
    this.updateInventory(updated);
  }

  /**
   * Remove one weapon copy from inventory
   */
  removeWeapon(instanceId: string): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      weapons: current.weapons.filter((w) => w.instanceId !== instanceId),
    };
    this.updateInventory(updated);
  }

  /**
   * Update one weapon copy's progress
   */
  updateWeaponProgress(instanceId: string, updates: Partial<WeaponProgressEntry>): void {
    const current = this.getCurrentInventory();
    const updated: CalculatorInventory = {
      ...current,
      weapons: current.weapons.map((w) => {
        if (w.instanceId !== instanceId) return w;
        const merged = { ...w, ...updates };
        // Automatically calculate ascensions from levels
        return {
          ...merged,
          currentAscension: this.getAscensionFromLevel(merged.currentLevel),
          goalAscension: this.getAscensionFromLevel(merged.goalLevel),
        };
      }),
    };
    this.updateInventory(updated);
  }

  /**
   * Get one weapon copy from inventory
   */
  getWeapon(instanceId: string): WeaponProgressEntry | undefined {
    return this.getCurrentInventory().weapons.find((w) => w.instanceId === instanceId);
  }

  /**
   * Track a craftable weapon; it starts at the default refine progress
   */
  addCraftable(entry: CraftableProgressEntry): void {
    const current = this.getCurrentInventory();
    const craftables = current.craftables ?? [];
    this.updateInventory({ ...current, craftables: [...craftables, entry] });
  }

  /**
   * Stop tracking one craftable weapon copy
   */
  removeCraftable(instanceId: string): void {
    const current = this.getCurrentInventory();
    this.updateInventory({
      ...current,
      craftables: (current.craftables ?? []).filter((c) => c.instanceId !== instanceId),
    });
  }

  /**
   * Update refine progress for one tracked craftable weapon copy
   */
  updateCraftableProgress(
    instanceId: string,
    updates: Partial<Omit<CraftableProgressEntry, 'instanceId' | 'weaponId'>>
  ): void {
    const current = this.getCurrentInventory();
    this.updateInventory({
      ...current,
      craftables: (current.craftables ?? []).map((c) =>
        c.instanceId === instanceId ? { ...c, ...updates } : c
      ),
    });
  }

  /**
   * Set how many of a material are owned; zero removes the entry
   */
  setOwnedMaterial(materialId: number, quantity: number): void {
    const current = this.getCurrentInventory();
    const amount = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
    const ownedMaterials = { ...current.ownedMaterials };
    if (amount > 0) {
      ownedMaterials[materialId] = amount;
    } else {
      delete ownedMaterials[materialId];
    }
    this.updateInventory({ ...current, ownedMaterials });
  }

  /**
   * Clear entire inventory
   */
  clearInventory(): void {
    this.updateInventory(EMPTY_INVENTORY);
    this.storageService.clearInventory();
  }

  /**
   * Internal method to update inventory and persist
   */
  private updateInventory(inventory: CalculatorInventory): void {
    this.inventorySubject.next(inventory);
    this.storageService.saveInventory(inventory);
  }
}
