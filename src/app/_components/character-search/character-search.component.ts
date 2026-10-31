import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElementType } from '../../_models/enum';
import { ImageService } from '../../_services/image.service';

// Matches the .dropdown max-height in the stylesheet
const DROPDOWN_MAX_HEIGHT = 250;

/** A selectable character; Travelers appear once per element */
export type CharacterOption = {
  characterId: number;
  element?: ElementType;
  name: string;
  normalizedName: string;
};

@Component({
  selector: 'app-character-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './character-search.component.html',
  styleUrl: './character-search.component.css',
})
export class CharacterSearchComponent {
  @Input() characters: CharacterOption[] = [];
  @Input() placeholder: string = '';
  @Output() characterSelected = new EventEmitter<CharacterOption>();

  search: string = '';
  showDropdown = false;
  openUp = false;

  constructor(
    private host: ElementRef<HTMLElement>,
    private imageService: ImageService,
  ) {}

  get filteredCharacters(): CharacterOption[] {
    const search = this.search.trim().toLowerCase();

    if (!search) return this.characters;

    return this.characters.filter((char) => {
      const name = char.name.toLowerCase();
      const normalizedName = char.normalizedName.toLowerCase();

      return name.includes(search) || normalizedName.includes(search);
    });
  }

  select(character: CharacterOption): void {
    this.characterSelected.emit(character);
    this.search = '';
    this.showDropdown = false;
  }

  open(): void {
    this.openUp = this.shouldOpenUp();
    this.showDropdown = true;
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

  private shouldOpenUp(): boolean {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;
  }
}
