import { Component, Input } from '@angular/core';
import { Character } from '../../../_models/character';
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
  @Input() char: Character | null = null;
  @Input() apikey: string | null = null;

  selectedMenu: 'profile' | 'talents' | 'constellations' = 'profile';

  get imageUrls() {
    return {
      icon: `assets/images/characters/${this.apikey}/icon.png`,
      iconCard: `assets/images/characters/${this.apikey}/card.png`,
      sideIcon: `assets/images/characters/${this.apikey}/side.png`,
      gachaSplash: `assets/images/characters/${this.apikey}/gacha-splash.png`,
      gachaSlice: `assets/images/characters/${this.apikey}/gacha-icon.png`,
    };
  }

  getElementColor(): string {
    if (!this.char) return '';
    return `var(--${this.char?.profile.elementText.toLowerCase()})`;
  }
}
