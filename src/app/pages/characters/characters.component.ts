import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import { Router } from '@angular/router';
import { CharacterCardComponent } from '../../_components/character-card/character-card.component';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from "../../_components/page-title/page-title.component";

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [CharacterCardComponent, FormsModule, PageTitleComponent],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css',
})
export class CharactersComponent implements OnInit {
  constructor(
    private characterService: CharacterService,
    private router: Router,
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
    this.characterService.getCharacters().subscribe((data) => {
      data = data.filter((char) => char.name !== 'Aether' && char.name !== 'Lumine' && char.name !== 'Manekin' && char.name !== 'Manekina');
      data.sort((a: CharacterProfile, b: CharacterProfile) => b.version.localeCompare(a.version));
      this.characterData = data;
      this.filteredCharacters = data;
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
  }

  getCharacterKey(name: string): string {
    return name.replace(/\s+/g, '').toLowerCase();
  }

  openDetails(name: string): void {
    this.router.navigate(['/characters', this.getCharacterKey(name)]);
  }
}
