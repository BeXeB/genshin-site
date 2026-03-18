import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { PageFilters } from '../../_models/filters';
import { FilterService } from '../../_services/filter.service';
import { FiltersComponent } from '../../_components/filters/filters.component';
import { ItemCardComponent } from '../../_components/item-card/item-card.component';
import { RouterLink } from '@angular/router';

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
export class CharactersComponent implements OnInit {
  private readonly STORAGE_KEY = 'characterFilters';

  constructor(
    private characterService: CharacterService,
    private filterService: FilterService,
  ) {}

  characterData: CharacterProfile[] = [];
  filteredCharacters: CharacterProfile[] = [];

  searchTerm = '';
  filters: PageFilters = {};

  filterGroups = [
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

  ngOnInit(): void {
    const state = this.filterService.loadState(this.STORAGE_KEY);
    this.filters = state.filters ?? {};
    this.searchTerm = state.searchTerm;

    this.characterService.getCharacters().subscribe((data) => {
      const filtered = data
        .filter((char) => char.name !== 'Manekin' && char.name !== 'Manekina')
        .sort((a, b) => a.elementText.localeCompare(b.elementText))
        .sort((a, b) => b.rarity - a.rarity)
        .sort((a, b) => b.version.localeCompare(a.version));
      this.characterData = filtered;

      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredCharacters = this.filterService.filter(
      this.characterData,
      this.searchTerm,
      (c) => c.name,
      this.filters,
      this.filterFns,
    );

    this.filterService.saveState(this.STORAGE_KEY, {
      filters: this.filters,
      searchTerm: this.searchTerm,
    });
  }

  onFiltersChange(filters: PageFilters) {
    this.filters = filters;
    this.applyFilters();
  }

  getIcons(char: CharacterProfile) {
    return {
      iconUrl: `assets/images/characters/${char.normalizedName}/icon.webp`,
      elementUrl: `assets/images/${char.elementText}.webp`,
      weaponUrl: `assets/images/${char.weaponText}.webp`,
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
