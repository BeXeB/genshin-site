import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterTabStateService {
  private readonly STORAGE_KEY = 'characterTabState';

  constructor(private storageService: StorageService) {}

  /**
   * Get the saved tab for a character, or return default 'profile'
   */
  getTabForCharacter(
    characterId: string,
  ): 'profile' | 'talents' | 'constellations' {
    const tabState = this.storageService.getData<Record<string, string>>(
      this.STORAGE_KEY,
    );
    if (!tabState) return 'profile';

    return (tabState[characterId] ?? 'profile') as
      'profile' | 'talents' | 'constellations';
  }

  /**
   * Save the selected tab for a character
   */
  setTabForCharacter(
    characterId: string,
    tab: 'profile' | 'talents' | 'constellations',
  ): void {
    const tabState =
      this.storageService.getData<Record<string, string>>(this.STORAGE_KEY) ??
      {};
    tabState[characterId] = tab;
    this.storageService.saveData(this.STORAGE_KEY, tabState);
  }

  /**
   * Clear all stored tab states
   */
  clearAll(): void {
    this.storageService.saveData(this.STORAGE_KEY, {});
  }
}
