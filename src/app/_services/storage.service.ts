import { Injectable } from '@angular/core';
import { Tierlist } from '../_models/tierlist';
import { StorageKeys } from '../_models/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  saveData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
    }
  }

  getData<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch (err) {
      console.error(`Failed to load ${key}:`, err);
      return null;
    }
  }

  saveTierlist(tierlist: Tierlist): void {
    try {
      localStorage.setItem(
        StorageKeys.TIERLIST_DATA,
        JSON.stringify(tierlist)
      );
    } catch (err) {
      console.error('Failed to save tierlist:', err);
    }
  }

  loadTierlist(): Tierlist | null {
    try {
      const json = localStorage.getItem(StorageKeys.TIERLIST_DATA);

      if (!json) {
        return null;
      }

      return JSON.parse(json) as Tierlist;
    } catch (err) {
      console.error('Failed to load tierlist:', err);
      return null;
    }
  }

  clearAllStorage(): void {
    try {
      localStorage.clear();
      console.log('All storage cleared');
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  }

  clearEditorData(): void {
    try {
      localStorage.removeItem(StorageKeys.TALENT_EDITOR_STATE);
      localStorage.removeItem(StorageKeys.CUSTOM_HYPERLINKS);

      console.log('Editor data cleared');
    } catch (err) {
      console.error('Failed to clear editor data:', err);
    }
  }
}
