import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CharacterTag, TagDefinition, Tier, TierCharacter } from '../_models/tierlist';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root',
})
export class TierlistService {
  private tierlistUrl = 'assets/json/tierlist.json';

  constructor(
    private http: HttpClient,
    private tagService: TagService,
  ) {}

  getTierlist(): Observable<Tier[]> {
    return combineLatest([
      this.http.get<Tier[]>(this.tierlistUrl),
      this.tagService.getTags(),
    ]).pipe(
      map(([tierlist, tags]) => {
        const tagMap: Map<string, TagDefinition> = new Map(tags.map((tag: TagDefinition) => [tag.id, tag]));

        return tierlist.map((tier: Tier) => ({
          ...tier,
          characters: tier.characters.map((character: TierCharacter) => ({
            ...character,
            tags: character.tags.map((tag: CharacterTag) => {
              const def = tagMap.get(tag.id);

              if (!def) {
                tag.color = "#999";
                tag.label = tag.id;
              } else {
                tag.color = def.color;
                tag.label = def.label;
              }

              return tag
            })
          })),
        }));
      }),
    );
  }
}
