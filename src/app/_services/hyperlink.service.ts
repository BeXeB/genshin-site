import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  combineLatest,
  map,
  Observable,
  shareReplay,
  startWith,
  Subject,
} from 'rxjs';
import { Hyperlink } from '../_models/hyperlinks';

@Injectable({
  providedIn: 'root',
})
export class HyperlinkService {
  private gameHyperlinksPath = 'assets/json/hyperlinks.json';
  private customHyperlinksPath = 'assets/json/custom-hyperlinks.json';

  private hyperlinks$?: Observable<Map<string | number, Hyperlink>>;
  private sessionHyperlinks: Map<string | number, Hyperlink> = new Map();
  private deletedCustomHyperlinkIds: Set<string | number> = new Set();
  private sessionUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  /**
   * Returns a Map of all hyperlinks (game + custom + session-added)
   * Keyed by: numeric ID for game hyperlinks, string ID for custom hyperlinks
   */
  getHyperlinksMap(): Observable<Map<string | number, Hyperlink>> {
    if (!this.hyperlinks$) {
      this.hyperlinks$ = combineLatest([
        this.http.get<Hyperlink[]>(this.gameHyperlinksPath),
        this.http.get<Hyperlink[]>(this.customHyperlinksPath),
        this.sessionUpdated$.pipe(
          startWith(undefined),
          map(() => this.sessionHyperlinks),
        ),
      ]).pipe(
        map(([gameLinks, customLinks]) => {
          const map = new Map<string | number, Hyperlink>();

          // Add game hyperlinks (numeric IDs)
          gameLinks.forEach((link) => {
            map.set(link.id, link);
          });

          // Add custom hyperlinks (string IDs), excluding deleted ones
          customLinks.forEach((link) => {
            if (!this.deletedCustomHyperlinkIds.has(link.id)) {
              map.set(link.id, link);
            }
          });

          // Add session hyperlinks (newly created during this session)
          this.sessionHyperlinks.forEach((link) => {
            map.set(link.id, link);
          });

          return map;
        }),
        shareReplay(1),
      );
    }

    return this.hyperlinks$;
  }

  getHyperlink(id: string | number): Observable<Hyperlink | undefined> {
    return this.getHyperlinksMap().pipe(
      map((hyperlinks) => hyperlinks.get(id)),
    );
  }

  /**
   * Add a new custom hyperlink to the session store
   * This makes it immediately available for search and export
   */
  addCustomHyperlink(hyperlink: Hyperlink): void {
    this.sessionHyperlinks.set(hyperlink.id, hyperlink);
    this.deletedCustomHyperlinkIds.delete(hyperlink.id);
    this.sessionUpdated$.next();
  }

  /**
   * Update an existing custom hyperlink
   */
  updateCustomHyperlink(
    id: string | number,
    name: string,
    description: string,
  ): void {
    const existing = this.sessionHyperlinks.get(id);
    if (existing) {
      existing.name = name;
      existing.description = description;
      this.sessionUpdated$.next();
    }
  }

  /**
   * Delete a custom hyperlink from the session store and mark it as deleted
   * Deleted hyperlinks will not be included in exports
   */
  deleteCustomHyperlink(id: string | number): void {
    this.sessionHyperlinks.delete(id);
    this.deletedCustomHyperlinkIds.add(id);
    this.sessionUpdated$.next();
  }
}
