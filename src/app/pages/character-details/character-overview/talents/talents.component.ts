import { Component, Input } from '@angular/core';
import { Character, CombatSkill } from '../../../../_models/character';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview-talents',
  imports: [FormsModule],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class OverviewTalentsComponent {
  @Input() char: Character | null = null;
  @Input() elementColor: string | null = null;

  talentLevels: number[] = [9, 9, 9];

  getTalentStats(talent: CombatSkill, level: number): string[] {
    const stats: string[] = [];
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
      stats.push(stat);
    }
    return stats;
  }
}
