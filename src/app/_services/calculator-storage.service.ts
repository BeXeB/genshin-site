import { Injectable } from '@angular/core';
import {
  CalculatorInventory,
  createDefaultCharacterProgress,
} from '../_models/calculator';
import { StorageService } from './storage.service';

const CALCULATOR_STORAGE_KEY = 'material-calculator-inventory';

@Injectable({
  providedIn: 'root',
})
export class CalculatorStorageService {
  constructor(private storageService: StorageService) {}

  /**
   * Save the calculator inventory to localStorage
   */
  saveInventory(inventory: CalculatorInventory): void {
    const inventoryWithTimestamp: CalculatorInventory = {
      ...inventory,
      lastUpdated: Date.now(),
    };
    this.storageService.saveData(CALCULATOR_STORAGE_KEY, inventoryWithTimestamp);
  }

  /**
   * Load the calculator inventory from localStorage
   */
  loadInventory(): CalculatorInventory | null {
    const inventory = this.storageService.getData<CalculatorInventory>(
      CALCULATOR_STORAGE_KEY,
    );
    if (!inventory) {
      return null;
    }

    // Fill in fields added after the inventory was saved (e.g. talent levels)
    return {
      ...inventory,
      characters: inventory.characters.map((entry) => ({
        ...createDefaultCharacterProgress(entry.characterId),
        ...entry,
      })),
      ownedMaterials: inventory.ownedMaterials ?? {},
    };
  }

  /**
   * Clear the calculator inventory from localStorage
   */
  clearInventory(): void {
    localStorage.removeItem(CALCULATOR_STORAGE_KEY);
  }

  /**
   * Check if an inventory exists in storage
   */
  hasInventory(): boolean {
    return this.loadInventory() !== null;
  }

  /**
   * Get the last updated timestamp of the inventory
   */
  getLastUpdatedTime(): number | null {
    const inventory = this.loadInventory();
    return inventory?.lastUpdated || null;
  }
}
