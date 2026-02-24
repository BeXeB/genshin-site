import { Component, Input } from '@angular/core';
import { CombatSkill, PassiveSkill } from '../../../../../_models/character';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-talent-details',
  imports: [FormsModule],
  templateUrl: './talent-details.component.html',
  styleUrl: './talent-details.component.css',
})
export class TalentDetailsComponent {
  @Input() talent: CombatSkill | PassiveSkill | null = null;
  @Input() elementColor: string | null = null;
  @Input() imageUrl: string | null = null;

  talentLevel = 9;

  incrementLevel() {
    const max = 13;
    if (this.talentLevel < max) {
      this.talentLevel++;
    }
  }

  decrementLevel() {
    const min = 1;
    if (this.talentLevel > min) {
      this.talentLevel--;
    }
  }

  getTalentStats(
    talent: CombatSkill | PassiveSkill,
    level: number,
  ): { name: string; value: string }[] {
    if (!this.IsCombatSkill) {
      return [];
    }
    const combatSkill = talent as CombatSkill;
    const stats: { name: string; value: string }[] = [];
    for (const label of combatSkill.attributes.labels) {
      let stat = label;
      const regex = /{param(\d+):([A-Z, 0-9]+)}/g;
      let paramName: string | null = null;
      let format: string | null = null;
      let match;
      while ((match = regex.exec(label)) !== null) {
        paramName = `param${match[1]}`;
        format = match[2];

        if (paramName && format) {
          const paramValue = combatSkill.attributes.parameters[paramName][level - 1];
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

  get IsCombatSkill(): boolean {
    return (this.talent as CombatSkill).attributes !== undefined;
  }
}
