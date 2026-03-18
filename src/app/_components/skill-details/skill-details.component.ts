import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  CombatTalent,
  PassiveTalent,
  ConstellationDetail,
} from '../../_models/character';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { FormatterService } from '../../_services/formatter.service';
import { Settings, SettingsService } from '../../_services/settings.service';

@Component({
  selector: 'app-skill-details',
  imports: [FormsModule],
  templateUrl: './skill-details.component.html',
  styleUrl: './skill-details.component.css',
})
export class SkillDetailsComponent implements OnInit, OnChanges {
  @Input() skill: CombatTalent | PassiveTalent | ConstellationDetail | null =
    null;
  @Input() elementColor: string | null = null;
  @Input() imageUrl: string | null = null;
  @Input() briefDescription: string | null = null;

  talentLevel = 9;
  isCombatSkill = false;

  talentDesc: SafeHtml = '';

  settings: Settings | undefined;

  constructor(
    private formatter: FormatterService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {
    if (this.skill) {
      this.isCombatSkill =
        (this.skill as CombatTalent).attributes !== undefined;
    }
    this.settingsService.settings.subscribe((settings) => {
      this.settings = settings;
      this.updateDescription();
      this.talentLevel = settings.talentlevel;
    });

    this.updateDescription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['skill'] || changes['briefDescription']) {
      this.updateDescription();
    }
  }

  incrementLevel() {
    const max = 15;
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
    talent: CombatTalent | PassiveTalent,
    level: number,
  ): { name: string; value: string }[] {
    if (!this.isCombatSkill) {
      return [];
    }
    const combatSkill = talent as CombatTalent;
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
          const paramValue =
            combatSkill.attributes.parameters[paramName][level - 1];
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

  updateDescription(): void {
    const finalDesc = this.settings?.detailed
      ? this.skill?.descriptionRaw
      : this.briefDescription;
    this.talentDesc = this.formatter.getFormattedText(finalDesc ?? '');
  }
}
