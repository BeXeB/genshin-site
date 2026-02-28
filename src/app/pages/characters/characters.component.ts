import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import { Router } from '@angular/router';
import { CharacterCardComponent } from '../../_components/character-card/character-card.component';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { StorageService } from '../../_services/storage.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CharacterCardComponent, FormsModule, PageTitleComponent],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css',
})
export class CharactersComponent implements OnInit {
  private readonly FILTERS_KEY = 'characterFilters';
  constructor(
    private characterService: CharacterService,
    private storageService: StorageService,
  ) {}

  elements: string[] = [
    'Anemo',
    'Geo',
    'Electro',
    'Dendro',
    'Hydro',
    'Pyro',
    'Cryo',
  ];
  weaponTypes: string[] = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];

  characterData: CharacterProfile[] = [];
  filteredCharacters: CharacterProfile[] = [];

  elementFilters: string[] = [];
  weaponFilters: string[] = [];
  rarityFilters: string[] = [];
  searchTerm: string = '';
  showFiltersDropdown: boolean = false;

  ngOnInit(): void {
    this.loadFilters();
    this.characterService.getCharacters().subscribe((data) => {
      data = data.filter(
        (char) =>
          char.name !== 'Aether' &&
          char.name !== 'Lumine' &&
          char.name !== 'Manekin' &&
          char.name !== 'Manekina',
      );
      data.sort((a: CharacterProfile, b: CharacterProfile) =>
        b.version.localeCompare(a.version),
      );
      this.characterData = data;
      this.onSearchTermChange();
    });
  }

  toggleFiltersDropdown(): void {
    this.showFiltersDropdown = !this.showFiltersDropdown;
  }

  toggleFilter(filterArray: string[], value: string): void {
    const index = filterArray.indexOf(value);
    if (index > -1) {
      filterArray.splice(index, 1);
    } else {
      filterArray.push(value);
    }
    this.onSearchTermChange();
    this.saveFilters();
  }
  onSearchTermChange(): void {
    let results = this.characterData.filter((char) =>
      char.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );

    if (this.elementFilters.length > 0) {
      results = results.filter((char) =>
        this.elementFilters.includes(char.elementText),
      );
    }

    if (this.weaponFilters.length > 0) {
      results = results.filter((char) =>
        this.weaponFilters.includes(char.weaponText),
      );
    }

    if (this.rarityFilters.length > 0) {
      results = results.filter((char) =>
        this.rarityFilters.includes(char.rarity.toString()),
      );
    }

    this.filteredCharacters = results;
    this.saveFilters();
  }
  private saveFilters(): void {
    this.storageService.saveData<CharacterFilters>(this.FILTERS_KEY, {
      elementFilters: this.elementFilters,
      weaponFilters: this.weaponFilters,
      rarityFilters: this.rarityFilters,
      searchTerm: this.searchTerm,
    });
  }

  private loadFilters(): void {
    const saved = this.storageService.getData<CharacterFilters>(
      this.FILTERS_KEY,
    );
    if (!saved) return;

    this.elementFilters = saved.elementFilters ?? [];
    this.weaponFilters = saved.weaponFilters ?? [];
    this.rarityFilters = saved.rarityFilters ?? [];
    this.searchTerm = saved.searchTerm ?? '';
  }
}

interface CharacterFilters {
  elementFilters: string[];
  weaponFilters: string[];
  rarityFilters: string[];
  searchTerm: string;
}
