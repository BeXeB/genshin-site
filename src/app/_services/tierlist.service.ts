import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CharacterTag,
  TagDefinition,
  Tier,
  TierCharacter,
  Tierlist,
} from '../_models/tierlist';

@Injectable({
  providedIn: 'root',
})
export class TierlistService {
  private tierlistUrl = 'assets/json/tierlist.json';

  constructor(private http: HttpClient) {}

  getTierlist(): Observable<Tierlist> {
    return this.http.get<Tierlist>(this.tierlistUrl).pipe(
      map((tierlist: Tierlist) => {
        const tagMap: Map<string, TagDefinition> = new Map(
          tierlist.tags.map((tag: TagDefinition) => [tag.id, tag]),
        );

        const tiersWithTags = tierlist.tiers.map((tier: Tier) => ({
          ...tier,
          characters: tier.characters.map((character: TierCharacter) => ({
            ...character,
            tags: character.tags.map((tag: CharacterTag) => {
              const def = tagMap.get(tag.id);

              if (!def) {
                return {
                  ...tag,
                  color: '#999',
                  label: tag.id,
                };
              }

              return {
                ...tag,
                color: def.color,
                label: def.label,
              };
            }),
          })),
        }));

        return {
          ...tierlist,
          tiers: tiersWithTags,
        };
      }),
    );
  }

  getTierlistFromJson(jsonContent: string): Tierlist {
    const tierlist: Tierlist = JSON.parse(jsonContent);

    const tagMap: Map<string, TagDefinition> = new Map(
      tierlist.tags.map((tag: TagDefinition) => [tag.id, tag]),
    );

    const tiersWithTags = tierlist.tiers.map((tier: Tier) => ({
      ...tier,
      characters: tier.characters.map((character: TierCharacter) => ({
        ...character,
        tags: character.tags.map((tag: CharacterTag) => {
          const def = tagMap.get(tag.id);

          if (!def) {
            return {
              ...tag,
              color: '#999',
              label: tag.id,
            };
          }

          return {
            ...tag,
            color: def.color,
            label: def.label,
          };
        }),
      })),
    }));

    return {
      ...tierlist,
      tiers: tiersWithTags,
    };
  }
}
