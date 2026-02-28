import { Injectable } from '@angular/core';
import { Tierlist } from '../_models/tierlist';

const STORAGE_KEY = 'tierlistData';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  saveTierlist(tierlist: Tierlist): void {
    try {
      const tiersWithoutProfile = tierlist.tiers.map((tier) => ({
        ...tier,
        characters: tier.characters.map(({ profile, ...rest }) => rest),
      }));
      const dataToSave = { ...tierlist, tiers: tiersWithoutProfile };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Failed to save tierlist:', err);
    }
  }

  loadTierlist(): Tierlist | null {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) return null;
      return JSON.parse(json) as Tierlist;
    } catch (err) {
      console.error('Failed to load tierlist:', err);
      return null;
    }
  }

  clearTierlist(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
