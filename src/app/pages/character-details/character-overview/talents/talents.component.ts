import { Component, Input } from '@angular/core';
import {
  CharacterBriefDescriptions,
  CharacterResolved,
  CombatTalent,
  PassiveTalent,
} from '../../../../_models/character';
import { FormsModule } from '@angular/forms';
import { SkillDetailsComponent } from '../../../../_components/skill-details/skill-details.component';
import { ElementType } from '../../../../_models/enum';
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

  getDescription(skill: CombatTalent | PassiveTalent | null, skillKey: string): string | null {
    if (!skill) return null;

    const briefKey = this.getBriefKey(skillKey) as keyof CharacterBriefDescriptions;

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

  get skillImageUrls() {
    const apiKey = this.apiKey ?? '';
    const element = [10000005, 10000007].includes(this.char?.profile.id ?? 0)
      ? this.element
      : undefined;
    const combat1Filename = this.skills?.images?.filename_combat1 || 'Skill_A_00';

    return {
      combat1: this.imageService.getSkillIcon(combat1Filename),
      combat2: this.imageService.getCharacterTalentIcon(apiKey, 'combat2', element),
      combat3: this.imageService.getCharacterTalentIcon(apiKey, 'combat3', element),
      passive1: this.imageService.getCharacterTalentIcon(apiKey, 'passive1', element),
      passive2: this.imageService.getCharacterTalentIcon(apiKey, 'passive2', element),
      passive3: this.imageService.getCharacterTalentIcon(apiKey, 'passive3', element),
      passive4: this.imageService.getCharacterTalentIcon(apiKey, 'passive4', element),
    };
  }
}
