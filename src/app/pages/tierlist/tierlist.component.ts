import { Component, ViewChild } from '@angular/core';
import { Tierlist } from '../../_models/tierlist';
import { TierlistService } from '../../_services/tierlist.service';
import { CharacterProfile } from '../../_models/character';
import { CharacterService } from '../../_services/character.service';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { TierlistDisplayComponent } from '../../_components/tierlist-display/tierlist-display.component';

@Component({
  selector: 'app-tierlist',
  standalone: true,
  imports: [PageTitleComponent, TierlistDisplayComponent],
  templateUrl: './tierlist.component.html',
  styleUrl: './tierlist.component.css',
})
export class TierlistComponent {
  @ViewChild(TierlistDisplayComponent) displayComponent!: TierlistDisplayComponent;

  constructor(
    private tierlistService: TierlistService,
    private characterService: CharacterService,
  ) { }

  tierlist: Tierlist = { tiers: [], tags: [] };
  characterMap: Map<string, CharacterProfile> = new Map();

  ngOnInit() {
    this.tierlistService
      .getTierlist()
      .subscribe((tierlist: Tierlist) => (this.tierlist = tierlist));
    this.characterService
      .getCharacters()
      .subscribe((characters: CharacterProfile[]) => {
        this.characterMap = new Map(
          characters.map((c: CharacterProfile) => [c.normalizedName, c]),
        );
      });
  }

  exportAsImage(format: 'png' | 'jpg' = 'png'): void {
    this.displayComponent?.exportAsImage(format);
  }
}
