import { Component } from '@angular/core';
import { Tier, TierCharacter } from '../../_models/tierlist';
import { TierlistService } from '../../_services/tierlist.service';
import { CharacterProfile } from '../../_models/character';
import { CharacterService } from '../../_services/character.service';

@Component({
  selector: 'app-tierlist',
  standalone: true,
  imports: [],
  templateUrl: './tierlist.component.html',
  styleUrl: './tierlist.component.css',
})
export class TierlistComponent {
  constructor(
    private tierlistService: TierlistService,
    private characterService: CharacterService,
  ) {}

  tierlist: Tier[] = [];
  characterMap: Map<string, CharacterProfile> = new Map();

  ngOnInit() {
    this.tierlistService
      .getTierlist()
      .subscribe((tiers: Tier[]) => (this.tierlist = tiers));
    this.characterService
      .getCharacters()
      .subscribe((characters: CharacterProfile[]) => {
        this.characterMap = new Map(
          characters.map((c: CharacterProfile) => [
            c.name.replace(/\s+/g, '').toLowerCase(),
            c,
          ]),
        );
        console.log(characters);
      });
  }

  getCharsWithProfile(
    tier: Tier,
  ): { character: TierCharacter; profile: CharacterProfile | undefined }[] {
    return tier.characters.map((c: TierCharacter) => ({
      character: c,
      profile: this.characterMap.get(c.apiKey),
    }));
  }

  getExtraNames(extra: string[]): string {
    return extra
      .map((key) => this.characterMap.get(key)?.name ?? key)
      .join(', ');
  }
}
