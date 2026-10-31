import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterProfile } from '../../_models/character';
import { ImageService } from '../../_services/image.service';

@Component({
  selector: 'app-character-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './character-search.component.html',
  styleUrl: './character-search.component.css',
})
export class CharacterSearchComponent {
  @Input() characters: CharacterProfile[] = [];
  @Input() placeholder: string = '';
  @Output() characterSelected = new EventEmitter<CharacterProfile>();

  search: string = '';
  showDropdown = false;

  constructor(private imageService: ImageService) {}

  get filteredCharacters(): CharacterProfile[] {
    const search = this.search.trim().toLowerCase();

    if (!search) return this.characters;

    return this.characters.filter((char) => {
      const name = char.name.toLowerCase();
      const normalizedName = char.normalizedName.toLowerCase();

      return name.includes(search) || normalizedName.includes(search);
    });
  }

  select(character: CharacterProfile): void {
    this.characterSelected.emit(character);
    this.search = '';
    this.showDropdown = false;
  }

  hideDropdown(): void {
    // Delay so a click on an option registers before the dropdown closes
    setTimeout(() => {
      this.showDropdown = false;
    }, 150);
  }

  getCharacterIcon(normalizedName: string): string {
    return this.imageService.getCharacterIcon(normalizedName);
  }
}
