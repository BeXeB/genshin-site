import { Injectable } from '@angular/core';
import { PageFilters, StoredFilters } from '../_models/filters';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(private storage: StorageService) {}

  filter<T>(
    data: T[],
    searchTerm: string,
    searchFn: (item: T) => string,
    filters: PageFilters = {},
    filterFns: Record<string, (item: T, values: string[]) => boolean> = {},
  ): T[] {
    let results = data ?? [];

    if (searchTerm) {
      results = results.filter((i) =>
        searchFn(i).toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    for (const key of Object.keys(filters ?? {})) {
      const values = filters[key];
      if (!values?.length) continue;

      const fn = filterFns[key];
      if (!fn) continue;

      results = results.filter((item) => fn(item, values));
    }

    return results;
  }

  loadState(key: string): StoredFilters {
    return (
      this.storage.getData<StoredFilters>(key) ?? {
        filters: {},
        searchTerm: '',
      }
    );
  }

  saveState(key: string, state: StoredFilters) {
    this.storage.saveData(key, state);
  }
}
