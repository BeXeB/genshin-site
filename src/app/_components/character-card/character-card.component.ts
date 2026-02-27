import { Component, Input, OnInit } from '@angular/core';
import { CharacterProfile } from '../../_models/character';
import { Router } from '@angular/router';

@Component({
  selector: 'app-character-card',
  imports: [],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.css',
})
export class CharacterCardComponent implements OnInit {
  @Input() char: CharacterProfile | null = null;

  charIconUrl: string = '';
  charElementUrl: string = '';
  charWeaponUrl: string = '';

  ngOnInit(): void {
    if (this.char) {
      this.charIconUrl = `assets/images/characters/${this.char.normalizedName}/icon.webp`;
      this.charElementUrl = `assets/images/${this.char.elementText}.webp`;
      this.charWeaponUrl = `assets/images/${this.char.weaponText}.webp`;
    }
  }

  constructor(private router: Router) {}


  openDetails() {
    this.router.navigate(['/characters', this.char?.normalizedName]);
  }

  getElementStyle(): Record<string, string> {
    if (this.char?.elementText === 'None') {
      return {};
    }

    const elementColors: Record<string, string> = {
      Pyro: 'var(--pyro)',
      Hydro: 'var(--hydro)',
      Anemo: 'var(--anemo)',
      Electro: 'var(--electro)',
      Dendro: 'var(--dendro)',
      Cryo: 'var(--cryo)',
      Geo: 'var(--geo)',
    };

    const color = this.char?.elementText
      ? (elementColors[this.char.elementText] ?? 'transparent')
      : 'transparent';

    return {
      'background-color': color,
      'mask-image': `url(${this.charElementUrl})`,
      '-webkit-mask-image': `url(${this.charElementUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }
}
