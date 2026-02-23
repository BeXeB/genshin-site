import { Component, Input } from '@angular/core';
import { Character } from '../../../../_models/character';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview-profile',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class OverviewProfileComponent {
  @Input() char: Character | null = null;
  @Input() elementColor: string | null = null;

  quickLevels = [
    '1',
    '5',
    '10',
    '15',
    '20',
    '20+',
    '25',
    '30',
    '35',
    '40+',
    '45',
    '50+',
    '55',
    '60+',
    '65',
    '70+',
    '75',
    '80+',
    '85',
    '90',
  ];

  level: string = '90';
  levelIndex: number = this.quickLevels.length - 1;

  updateLevelFromIndex() {
    this.level = this.quickLevels[this.levelIndex].toString();
  }

  validateLevel() {
    const ascensionPattern = /^(20|40|50|60|70|80)\+$/;
    if (ascensionPattern.test(this.level)) {
      return;
    }

    let num = parseInt(this.level);
    if (isNaN(num)) {
      this.level = '1';
    } else {
      this.level = Math.min(90, Math.max(1, num)).toString();
    }
  }
}
