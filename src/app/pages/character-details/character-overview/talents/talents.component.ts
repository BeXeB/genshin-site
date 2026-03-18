import { Component, Input } from '@angular/core';
import {
  CharacterBriefDescriptions,
  CharacterResolved,
  CombatTalent,
  PassiveTalent,
} from '../../../../_models/character';
import { FormsModule } from '@angular/forms';
import { SkillDetailsComponent } from '../../../../_components/skill-details/skill-details.component';
import { ElementType, ElementTypeLabel } from '../../../../_models/enum';

@Component({
  selector: 'app-overview-talents',
  imports: [FormsModule, SkillDetailsComponent],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class OverviewTalentsComponent {
  @Input() char: CharacterResolved | null = null;
  @Input() apiKey: string | null = null;
  @Input() elementColor: string | null = null;
  @Input() element: ElementType = ElementType.ANEMO;

  private getBriefKey(skillName: string): string {
    const map: Record<string, string> = {
      combat1: 'combat1',
      combat2: 'combat2',
      combat3: 'combat3',

      passive1: 'passive1',
      passive2: 'passive2',
      passive3: 'passive3',
      passive4: 'passive4',
    };
    return map[skillName] || '';
  }

  getDescription(
    skill: CombatTalent | PassiveTalent | null,
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

  get skills() {
    if (!this.char) return null;

    if (this.char.variants && this.element) {
      return this.char.variants[this.element]?.skills;
    }

    return this.char.skills;
  }

  get combat1Url(): string {
    const filename = this.skills?.images?.filename_combat1;

    return `assets/images/${filename || 'Skill_A_00'}.webp`;
  }

  get skillImageUrls() {
    const base = this.basePath;

    return {
      combat1: this.combat1Url,
      combat2: `${base}/skills/combat2.webp`,
      combat3: `${base}/skills/combat3.webp`,
      passive1: `${base}/skills/passive1.webp`,
      passive2: `${base}/skills/passive2.webp`,
      passive3: `${base}/skills/passive3.webp`,
      passive4: `${base}/skills/passive4.webp`,
    };
  }
}
