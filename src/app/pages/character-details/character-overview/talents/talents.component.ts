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
import { ImageService } from '../../../../_services/image.service';

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

  constructor(private imageService: ImageService) {}

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

  get skills() {
    if (!this.char) return null;

    if (this.char.variants && this.element) {
      return this.char.variants[this.element]?.skills;
    }

    return this.char.skills;
  }

  get combat1Url(): string {
    const filename = this.skills?.images?.filename_combat1;

    if (filename) {
      return this.imageService.getSkillIcon(filename);
    }

    return this.imageService.getSkillIcon('Skill_A_00');
  }

  get skillImageUrls() {
    if (!this.apiKey) {
      return {
        combat1: '',
        combat2: '',
        combat3: '',
        passive1: '',
        passive2: '',
        passive3: '',
        passive4: '',
      };
    }

    const isTraveler = this.char?.profile.isTraveler;
    const elementLabel = isTraveler ? ElementTypeLabel[this.element] : undefined;

    return {
      combat1: this.combat1Url,
      combat2: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'combat2',
        elementLabel,
      ),
      combat3: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'combat3',
        elementLabel,
      ),
      passive1: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'passive1',
        elementLabel,
      ),
      passive2: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'passive2',
        elementLabel,
      ),
      passive3: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'passive3',
        elementLabel,
      ),
      passive4: this.imageService.getCharacterSkillImage(
        this.apiKey,
        'passive4',
        elementLabel,
      ),
    };
  }
}
