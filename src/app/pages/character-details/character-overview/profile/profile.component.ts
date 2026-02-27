import { Component, Input } from '@angular/core';
import { CharacterResolved } from '../../../../_models/character';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview-profile',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class OverviewProfileComponent {
  @Input() char: CharacterResolved | null = null;
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
    '95',
    '100',
  ];

  level: string = '90';
  levelIndex: number = this.quickLevels.indexOf(this.level);

  updateLevelFromIndex() {
    this.level = this.quickLevels[this.levelIndex].toString();
  }

  validateLevel() {
    const ascensionPattern = /^(20|40|50|60|70|80)\+$/;
    if (ascensionPattern.test(this.level)) {
      this.setLevel(this.level);
      return;
    }

    let num = parseInt(this.level);
    if (isNaN(num)) {
      this.setLevel('1');
    } else {
      if ((num >= 91 && num <= 94) || (num >= 96 && num <= 99)) {
        this.setLevel('90');
      } else {
        num = Math.max(1, Math.min(100, num));
        this.setLevel(num.toString());
      }
    }
  }

  setLevel(level: string) {
    this.level = level;

    const index = this.quickLevels.indexOf(level);
    console.log('Setting level to:', level, 'Index found:', index);

    const closestIndex = this.quickLevels.reduce((closest, current, idx) => {
      const currentNum = parseInt(current);
      const closestNum = parseInt(this.quickLevels[closest]);
      const targetNum = parseInt(level);
      if (isNaN(currentNum) || isNaN(closestNum) || isNaN(targetNum)) {
        return closest;
      }
      return Math.abs(currentNum - targetNum) < Math.abs(closestNum - targetNum)
        ? idx
        : closest;
    }, 0);

    this.levelIndex = index !== -1 ? index : closestIndex;
  }
}
