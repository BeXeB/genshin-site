import { Component } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { ImageService } from '../../_services/image.service';
import { CharacterProfile } from '../../_models/character';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { PageFilters, FilterGroup } from '../../_models/filters';
import { FilterService } from '../../_services/filter.service';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { RouterLink } from '@angular/router';
import { BaseListComponent } from '../../_components/base-list.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    FormsModule,
    PageTitleComponent,
    FiltersComponent,
    ItemCardComponent,
    RouterLink,
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css',
})
export class CharactersComponent extends BaseListComponent<CharacterProfile> {
  private readonly _storageKey = 'characterFilters';

  data: CharacterProfile[] = [];
  filtered: CharacterProfile[] = [];

  searchTerm = '';
  filters: PageFilters = {};

  filterGroups: FilterGroup[] = [
    {
      label: 'Elemek',
      key: 'elements',
      options: ['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo'],
    },
    {
      label: 'Fegyverek',
      key: 'weapons',
      options: ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'],
    },
    {
      label: 'Ritkaság',
      key: 'rarity',
      options: ['5', '4'],
    },
  ];

  filterFns = {
    elements: (c: CharacterProfile, values: string[]) =>
      values.includes(c.elementText),

    weapons: (c: CharacterProfile, values: string[]) =>
      values.includes(c.weaponText),

    rarity: (c: CharacterProfile, values: string[]) =>
      values.includes(c.rarity.toString()),
  };

  get storageKey(): string {
    return this._storageKey;
  }

  constructor(
    private characterService: CharacterService,
    protected override filterService: FilterService,
    private imageService: ImageService,
  ) {
    super(filterService);
  }

  loadData(): Observable<CharacterProfile[]> {
    return this.characterService.getCharacters();
  }

  transformData(data: CharacterProfile[]): CharacterProfile[] {
    return data
      .filter((char) => char.name !== 'Manekin' && char.name !== 'Manekina')
      .sort((a, b) => a.elementText.localeCompare(b.elementText))
      .sort((a, b) => b.rarity - a.rarity)
      .sort((a, b) => b.version.localeCompare(a.version));
  }

  getIcons(char: CharacterProfile) {
    return {
      iconUrl: this.imageService.getCharacterIcon(char.normalizedName),
      elementUrl: this.imageService.getElementIcon(char.elementText),
      weaponUrl: this.imageService.getWeaponTypeIcon(char.weaponText),
    };
  }

  getElementStyle(char: CharacterProfile): Record<string, string> {
    if (char?.elementText === 'None') {
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

    const color = char?.elementText
      ? (elementColors[char.elementText] ?? 'transparent')
      : 'transparent';

    return {
      'background-color': color,
      'mask-image': `url(${this.getIcons(char).elementUrl})`,
      '-webkit-mask-image': `url(${this.getIcons(char).elementUrl})`,
      'mask-size': 'cover',
      '-webkit-mask-size': 'cover',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-repeat': 'no-repeat',
    };
  }
}
