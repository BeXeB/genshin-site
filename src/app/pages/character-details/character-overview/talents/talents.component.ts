import { Component, Input } from '@angular/core';
import { Character, CombatTalent } from '../../../../_models/character';
import { FormsModule } from '@angular/forms';
import { TalentDetailsComponent } from './talent-details/talent-details.component';

@Component({
  selector: 'app-overview-talents',
  imports: [FormsModule, TalentDetailsComponent],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class OverviewTalentsComponent {
  @Input() char: Character | null = null;
  @Input() apiKey: string | null = null;
  @Input() elementColor: string | null = null;

  talentLevels: number[] = [9, 9, 9];

  getTalentStats(
    talent: CombatTalent,
    level: number,
  ): { name: string; value: string }[] {
    const stats: { name: string; value: string }[] = [];
    for (const label of talent.attributes.labels) {
      let stat = label;
      const regex = /{param(\d+):([A-Z, 0-9]+)}/g;
      let paramName: string | null = null;
      let format: string | null = null;
      let match;
      while ((match = regex.exec(label)) !== null) {
        paramName = `param${match[1]}`;
        format = match[2];

        if (paramName && format) {
          const paramValue = talent.attributes.parameters[paramName][level - 1];
          let formattedValue: string;
          switch (format) {
            case 'F1P':
              formattedValue = `${(paramValue * 100).toFixed(1)}%`;
              break;
            case 'P':
              formattedValue = `${(paramValue * 100).toFixed(0)}%`;
              break;
            default:
              formattedValue = paramValue.toString();
          }

          stat = stat.replace(match[0], formattedValue);
        }
      }
      const parts = stat.split('|');
      stats.push({
        name: parts[0].trim(),
        value: parts[1] ? parts[1].trim() : '',
      });
    }
    return stats;
  }

  get talentImageUrls() {
    return {
      combat1: `assets/images/${this.char?.skills?.images?.filename_combat1 || 'Skill_A_00'}.png`,
      combat2: `assets/images/characters/${this.apiKey}/skills/combat2.png`,
      combat3: `assets/images/characters/${this.apiKey}/skills/combat3.png`,
      passive1: `assets/images/characters/${this.apiKey}/skills/passive1.png`,
      passive2: `assets/images/characters/${this.apiKey}/skills/passive2.png`,
      passive3: `assets/images/characters/${this.apiKey}/skills/passive3.png`,
      passive4: `assets/images/characters/${this.apiKey}/skills/passive4.png`,
    };
  }
}
