import { Component, Input, OnInit } from '@angular/core';
import { WeaponResolved } from '../../../_models/weapons';

@Component({
  selector: 'app-weapon-card',
  imports: [],
  templateUrl: './weapon-card.component.html',
  styleUrl: './weapon-card.component.css',
})
export class WeaponCardComponent implements OnInit {
  @Input() weapon: WeaponResolved | null = null;
  @Input() rarityColor: string = 'var(--black)';

  iconUrl: string = '';
  typeUrl: string = '';

  ngOnInit(): void {
    if (this.weapon) {
      this.iconUrl = `assets/images/weapons/${this.weapon.normalizedName}/icon.webp`;
      this.typeUrl = `assets/images/${this.weapon.weaponText}.webp`;
    }
  }
}
