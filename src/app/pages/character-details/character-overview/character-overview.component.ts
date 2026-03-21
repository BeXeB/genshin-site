import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CharacterResolved } from '../../../_models/character';
import { FormsModule } from '@angular/forms';
import { OverviewProfileComponent } from './profile/profile.component';
import { OverviewConstellationsComponent } from './constellations/constellations.component';
import { OverviewTalentsComponent } from './talents/talents.component';
import { ElementType, ElementTypeLabel } from '../../../_models/enum';
import { ImageService } from '../../../_services/image.service';

@Component({
  selector: 'app-character-overview',
  imports: [
    FormsModule,
    OverviewProfileComponent,
    OverviewConstellationsComponent,
    OverviewTalentsComponent,
  ],
  templateUrl: './character-overview.component.html',
  styleUrl: './character-overview.component.css',
})
export class CharacterOverviewComponent {
  @Input() char: CharacterResolved | null = null;
  @Input() apikey: string | null = null;
  @Input() elementColor: string | null = null;
  @Input() selectedElement: ElementType = ElementType.ANEMO;
  @Output() elementChange = new EventEmitter<ElementType>();

  selectedMenu: 'profile' | 'talents' | 'constellations' = 'profile';

  constructor(private imageService: ImageService) {}

  get imageUrls() {
    if (!this.apikey) {
      return {
        icon: '',
        iconCard: '',
        sideIcon: '',
        gachaSplash: '',
        gachaSlice: '',
      };
    }

    return {
      icon: this.imageService.getCharacterIcon(this.apikey),
      iconCard: this.imageService.getCharacterCardImage(this.apikey),
      sideIcon: this.imageService.getCharacterSideImage(this.apikey),
      gachaSplash: this.imageService.getCharacterGachaSplash(this.apikey),
      gachaSlice: this.imageService.getCharacterGachaIcon(this.apikey),
    };
  }

  // --------------------------
  // |  TRAVELLER SPECIFIC    |
  // --------------------------

  elements = Object.values(ElementType).filter(
    (e) => e != ElementType.NONE && e != ElementType.CRYO,
  );

  selectElement(element: ElementType) {
    this.elementChange.emit(element);
  }

  isTraveller(): boolean {
    return (
      this.char?.profile.normalizedName === 'aether' ||
      this.char?.profile.normalizedName === 'lumine'
    );
  }

  elementColors: Record<ElementType, string> = {
    ELEMENT_PYRO: 'var(--pyro)',
    ELEMENT_HYDRO: 'var(--hydro)',
    ELEMENT_ANEMO: 'var(--anemo)',
    ELEMENT_ELECTRO: 'var(--electro)',
    ELEMENT_DENDRO: 'var(--dendro)',
    ELEMENT_CRYO: 'var(--cryo)',
    ELEMENT_GEO: 'var(--geo)',
    ELEMENT_NONE: 'var(--black)',
  };

  elementTypeLabel = ElementTypeLabel;

  getElementIconUrl(element: ElementType): string {
    const elementLabel = ElementTypeLabel[element];
    return this.imageService.getElementIcon(elementLabel);
  }

  getElementStyle(
    element: ElementType,
    imageUrl: string,
  ): Record<string, string> {
    const color = this.elementColors[element] ?? 'transparent';

    return {
      'background-color': color,
      'mask-image': `url(${imageUrl})`,
      '-webkit-mask-image': `url(${imageUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }
}
