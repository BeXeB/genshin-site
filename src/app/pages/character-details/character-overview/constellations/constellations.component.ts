import { Component, Input } from '@angular/core';
import {
  CharacterBriefDescriptions,
  CharacterResolved,
  ConstellationDetail,
} from '../../../../_models/character';
import { SkillDetailsComponent } from '../../../../_components/skill-details/skill-details.component';
import { ElementType, ElementTypeLabel } from '../../../../_models/enum';
import { ImageService } from '../../../../_services/image.service';

@Component({
  selector: 'app-overview-constellations',
  imports: [SkillDetailsComponent],
  templateUrl: './constellations.component.html',
  styleUrl: './constellations.component.css',
})
export class OverviewConstellationsComponent {
  @Input() char: CharacterResolved | null = null;
  @Input() apiKey: string | null = null;
  @Input() elementColor: string | null = null;
  @Input() element: ElementType = ElementType.ANEMO;

  constructor(private imageService: ImageService) {}

  private getBriefKey(skillName: string): string {
    const map: Record<string, string> = {
      c1: 'c1',
      c2: 'c2',
      c3: 'c3',
      c4: 'c4',
      c5: 'c5',
      c6: 'c6',
    };
    return map[skillName] || '';
  }

  getDescription(
    skill: ConstellationDetail | null,
    skillKey: string,
  ): string | null {
    if (!skill) return null;

    const briefKey = this.getBriefKey(
      skillKey,
    ) as keyof CharacterBriefDescriptions;

    const variantBrief = this.char?.variants?.[this.element]?.brief?.[briefKey];

    const mainBrief = this.char?.brief?.[briefKey];

    return variantBrief ?? mainBrief ?? skill.descriptionRaw;
  }

  get constellation() {
    if (!this.char) return null;

    if (this.char.variants && this.element) {
      return this.char.variants[this.element]?.constellation;
    }

    return this.char.constellation;
  }

  get skillImageUrls() {
    if (!this.apiKey) {
      return {
        c1: '',
        c2: '',
        c3: '',
        c4: '',
        c5: '',
        c6: '',
      };
    }

    const isTraveler = this.char?.profile.isTraveler;
    const elementLabel = isTraveler ? ElementTypeLabel[this.element] : undefined;

    return {
      c1: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c1',
        elementLabel,
      ),
      c2: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c2',
        elementLabel,
      ),
      c3: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c3',
        elementLabel,
      ),
      c4: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c4',
        elementLabel,
      ),
      c5: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c5',
        elementLabel,
      ),
      c6: this.imageService.getCharacterConstellationImage(
        this.apiKey,
        'c6',
        elementLabel,
      ),
    };
  }
}
