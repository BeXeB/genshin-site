import { Component, Input } from '@angular/core';
import { Character } from '../../../../_models/character';
import { ConstellationDetailsComponent } from './constellation-details/constellation-details.component';

@Component({
  selector: 'app-overview-constellations',
  imports: [ConstellationDetailsComponent],
  templateUrl: './constellations.component.html',
  styleUrl: './constellations.component.css',
})
export class OverviewConstellationsComponent {
  @Input() char: Character | null = null;
  @Input() apiKey: string | null = null;
  @Input() elementColor: string | null = null;

    get constellationImageUrls() {
    return {
      c1: `assets/images/characters/${this.apiKey}/constellation/c1.png`,
      c2: `assets/images/characters/${this.apiKey}/constellation/c2.png`,
      c3: `assets/images/characters/${this.apiKey}/constellation/c3.png`,
      c4: `assets/images/characters/${this.apiKey}/constellation/c4.png`,
      c5: `assets/images/characters/${this.apiKey}/constellation/c5.png`,
      c6: `assets/images/characters/${this.apiKey}/constellation/c6.png`,
    };
  }
}
