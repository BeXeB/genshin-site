import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, shareReplay, startWith, Subject } from 'rxjs';

import { Hyperlink } from '../_models/hyperlinks';
import { StorageService } from './storage.service';
import { StorageKeys } from '../_models/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkService {
  private gameHyperlinksPath = 'assets/json/hyperlinks.json';
  private customHyperlinksPath = 'assets/json/custom-hyperlinks.json';

  private hyperlinks$?: Observable<Map<string | number, Hyperlink>>;
  private customHyperlinksUpdated$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getHyperlinksMap(): Observable<Map<string | number, Hyperlink>> {
    if (!this.hyperlinks$) {
      this.hyperlinks$ = combineLatest([
        this.http.get<Hyperlink[]>(this.gameHyperlinksPath),
        this.getCustomHyperlinks(),
      ]).pipe(
        map(([gameLinks, customLinks]) => {
          const map = new Map<string | number, Hyperlink>();

          // Game hyperlinks
          gameLinks.forEach((link) => {
            map.set(link.id, link);
          });

          // Custom hyperlinks
          customLinks.forEach((link) => {
            map.set(link.id, link);
          });

          return map;
        }),
        shareReplay(1)
      );
    }

    return this.hyperlinks$;
  }

  getHyperlink(id: string | number): Observable<Hyperlink | undefined> {
    return this.getHyperlinksMap().pipe(map((hyperlinks) => hyperlinks.get(id)));
  }

  /**
   * Read custom hyperlinks directly from localStorage.
   */
  private getCustomHyperlinksFromStorage(): Hyperlink[] {
    return this.storageService.getData<Hyperlink[]>(StorageKeys.CUSTOM_HYPERLINKS) || [];
  }

  addCustomHyperlink(hyperlink: Hyperlink): void {
    const customLinks = this.getCustomHyperlinksFromStorage();

    customLinks.push(hyperlink);

    this.storageService.saveData(StorageKeys.CUSTOM_HYPERLINKS, customLinks);

    const deletedIds = this.getDeletedCustomHyperlinkIds().filter((id) => id !== hyperlink.id);

    this.storageService.saveData(StorageKeys.DELETED_CUSTOM_HYPERLINK_IDS, deletedIds);

    this.customHyperlinksUpdated$.next();
  }

  updateCustomHyperlink(id: string | number, name: string, description: string): void {
    const customLinks = this.getCustomHyperlinksFromStorage();

    const link = customLinks.find((h) => h.id === id);

    if (link) {
      link.name = name;
      link.description = description;
    } else {
      customLinks.push({
        id,
        name,
        description,
        isCustom: true,
      });
    }

    this.storageService.saveData(StorageKeys.CUSTOM_HYPERLINKS, customLinks);

    const deletedIds = this.getDeletedCustomHyperlinkIds().filter((deletedId) => deletedId !== id);

    this.storageService.saveData(StorageKeys.DELETED_CUSTOM_HYPERLINK_IDS, deletedIds);

    this.customHyperlinksUpdated$.next();
  }

  deleteCustomHyperlink(id: string | number): void {
    const customLinks = this.getCustomHyperlinksFromStorage();

    const filtered = customLinks.filter((h) => h.id !== id);

    this.storageService.saveData(StorageKeys.CUSTOM_HYPERLINKS, filtered);

    const deletedIds = this.getDeletedCustomHyperlinkIds();

    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
    }

    this.storageService.saveData(StorageKeys.DELETED_CUSTOM_HYPERLINK_IDS, deletedIds);

    this.customHyperlinksUpdated$.next();
  }

  emitSessionUpdate(): void {
    this.customHyperlinksUpdated$.next();
  }

  getCustomHyperlinks(): Observable<Hyperlink[]> {
    return combineLatest([
      this.http.get<Hyperlink[]>('assets/json/custom-hyperlinks.json'),

      this.customHyperlinksUpdated$.pipe(
        startWith(undefined),
        map(() => this.getCustomHyperlinksFromStorage())
      ),
    ]).pipe(
      map(([jsonLinks, storedLinks]) => {
        const deletedIds = new Set(this.getDeletedCustomHyperlinkIds());

        const links = new Map<string | number, Hyperlink>();

        // Original custom hyperlinks
        jsonLinks.forEach((link) => {
          if (!deletedIds.has(link.id)) {
            links.set(link.id, link);
          }
        });

        // New/updated custom hyperlinks
        storedLinks.forEach((link) => {
          if (!deletedIds.has(link.id)) {
            links.set(link.id, link);
          }
        });

        return Array.from(links.values());
      }),
      shareReplay(1)
    );
  }

  private getDeletedCustomHyperlinkIds(): (string | number)[] {
    return (
      this.storageService.getData<(string | number)[]>(StorageKeys.DELETED_CUSTOM_HYPERLINK_IDS) ||
      []
    );
  }
}
