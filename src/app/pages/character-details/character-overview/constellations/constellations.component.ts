import { Component, Input } from '@angular/core';
import {
  CharacterBriefDescriptions,
  CharacterResolved,
  ConstellationDetail,
} from '../../../../_models/character';
import { SkillDetailsComponent } from '../../../../_components/skill-details/skill-details.component';
import { ElementType, ElementTypeLabel } from '../../../../_models/enum';

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

  get basePath(): string {
    if (!this.apiKey) return '';

    if (this.char?.profile.isTraveler) {
      return `assets/images/characters/${this.apiKey}/${ElementTypeLabel[this.element].toLocaleLowerCase()}`;
    }

    return `assets/images/characters/${this.apiKey}`;
  }

  get constellation() {
    if (!this.char) return null;

    if (this.char.variants && this.element) {
      return this.char.variants[this.element]?.constellation;
    }

    return this.char.constellation;
  }

  get skillImageUrls() {
    const base = this.basePath;

    return {
      c1: `${base}/constellation/c1.webp`,
      c2: `${base}/constellation/c2.webp`,
      c3: `${base}/constellation/c3.webp`,
      c4: `${base}/constellation/c4.webp`,
      c5: `${base}/constellation/c5.webp`,
      c6: `${base}/constellation/c6.webp`,
    };
  }
}
