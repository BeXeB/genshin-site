import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, shareReplay, startWith, Subject } from 'rxjs';
import { Hyperlink } from '../_models/hyperlinks';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkService {
  private gameHyperlinksPath = 'assets/json/hyperlinks.json';
  private customHyperlinksStorageKey = 'customHyperlinks';

  private hyperlinks$?: Observable<Map<string | number, Hyperlink>>;
  private customHyperlinksUpdated$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  /**
   * Returns a Map of all hyperlinks (game + custom)
   * Custom hyperlinks are persisted in localStorage
   * Keyed by: numeric ID for game hyperlinks, string ID for custom hyperlinks
   */
  getHyperlinksMap(): Observable<Map<string | number, Hyperlink>> {
    if (!this.hyperlinks$) {
      this.hyperlinks$ = combineLatest([
        this.http.get<Hyperlink[]>(this.gameHyperlinksPath),
        this.customHyperlinksUpdated$.pipe(
          startWith(undefined),
          map(() => this.getCustomHyperlinksFromStorage())
        ),
      ]).pipe(
        map(([gameLinks, customLinks]) => {
          const map = new Map<string | number, Hyperlink>();

          // Add game hyperlinks (numeric IDs)
          gameLinks.forEach((link) => {
            map.set(link.id, link);
          });

          // Add custom hyperlinks (string IDs, persisted in storage)
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
   * Get custom hyperlinks from storage
   */
  private getCustomHyperlinksFromStorage(): Hyperlink[] {
    return this.storageService.getData<Hyperlink[]>(this.customHyperlinksStorageKey) || [];
  }

  /**
   * Add a new custom hyperlink and persist to storage
   */
  addCustomHyperlink(hyperlink: Hyperlink): void {
    const customLinks = this.getCustomHyperlinksFromStorage();
    customLinks.push(hyperlink);
    this.storageService.saveData(this.customHyperlinksStorageKey, customLinks);
    this.customHyperlinksUpdated$.next();
  }

  /**
   * Update an existing custom hyperlink
   */
  updateCustomHyperlink(id: string | number, name: string, description: string): void {
    const customLinks = this.getCustomHyperlinksFromStorage();
    const link = customLinks.find((h) => h.id === id);
    if (link) {
      link.name = name;
      link.description = description;
      this.storageService.saveData(this.customHyperlinksStorageKey, customLinks);
      this.customHyperlinksUpdated$.next();
    }
  }

  /**
   * Delete a custom hyperlink from storage
   */
  deleteCustomHyperlink(id: string | number): void {
    const customLinks = this.getCustomHyperlinksFromStorage();
    const filtered = customLinks.filter((h) => h.id !== id);
    this.storageService.saveData(this.customHyperlinksStorageKey, filtered);
    this.customHyperlinksUpdated$.next();
  }

  /**
   * Emit an update event to notify subscribers of changes
   * Used by editor views to trigger list updates
   */
  emitSessionUpdate(): void {
    this.customHyperlinksUpdated$.next();
  }
}
