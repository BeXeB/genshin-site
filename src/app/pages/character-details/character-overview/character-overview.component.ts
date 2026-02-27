import { Component, Input } from '@angular/core';
import { CharacterResolved } from '../../../_models/character';
import { FormsModule } from '@angular/forms';
import { OverviewProfileComponent } from "./profile/profile.component";
import { OverviewConstellationsComponent } from "./constellations/constellations.component";
import { OverviewTalentsComponent } from "./talents/talents.component";

@Component({
  selector: 'app-character-overview',
  imports: [FormsModule, OverviewProfileComponent, OverviewConstellationsComponent, OverviewTalentsComponent],
  templateUrl: './character-overview.component.html',
  styleUrl: './character-overview.component.css',
})
export class CharacterOverviewComponent {
  @Input() char: CharacterResolved | null = null;
  @Input() apikey: string | null = null;
  @Input() elementColor: string | null = null;

  selectedMenu: 'profile' | 'talents' | 'constellations' = 'profile';

  get imageUrls() {
    return {
      icon: `assets/images/characters/${this.apikey}/icon.webp`,
      iconCard: `assets/images/characters/${this.apikey}/card.webp`,
      sideIcon: `assets/images/characters/${this.apikey}/side.webp`,
      gachaSplash: `assets/images/characters/${this.apikey}/gacha-splash.webp`,
      gachaSlice: `assets/images/characters/${this.apikey}/gacha-icon.webp`,
    };
  }
}
