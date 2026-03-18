import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly STORAGE_KEY = 'settings';

  private settings$ = new BehaviorSubject<Settings>({
    detailed: true,
    talentlevel: 9,
  });

  constructor(private storage: StorageService) {
    const saved: Settings | null = this.storage.getData(this.STORAGE_KEY);
    if (saved) {
      this.settings$.next({ ...this.settings$.value, ...saved });
    }
  }

  get settings(): BehaviorSubject<Settings> {
    return this.settings$;
  }

  changeOption<T extends SettingsKey>(key: T, newValue: Settings[T]): void {
    const newSettings = { ...this.settings$.value, [key]: newValue };
    this.settings$.next(newSettings);
    this.storage.saveData(this.STORAGE_KEY, newSettings);
  }
}

export type Settings = {
  detailed: boolean;
  talentlevel: number;
};

export type SettingsKey = keyof Settings;
