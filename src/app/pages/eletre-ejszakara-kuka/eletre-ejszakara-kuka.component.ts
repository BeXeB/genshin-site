import { Component, OnInit } from '@angular/core';
import { PageTitleComponent } from '../../_components/page-title/page-title.component';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';

@Component({
  selector: 'app-eletre-ejszakara-kuka',
  imports: [PageTitleComponent],
  templateUrl: './eletre-ejszakara-kuka.component.html',
  styleUrl: './eletre-ejszakara-kuka.component.css',
})
export class EletreEjszakaraKukaComponent implements OnInit {
  constructor(
    private characterService: CharacterService
  ) {}

  isRoundStarted: boolean = false;

  characters: CharacterProfile[] = [];
  selectedCharacters: CharacterProfile[] = [];

  usedCharacterSlugs: string[] = [];
  removedCharacterSlugs: string[] = [
    "nahida",
    "qiqi",
    "klee",
    "diona",
    "sayu",
    "dori",
    "yaoyao",
    "kachina",
    "aino",
    "prune"
  ];

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe((characters) => {
      this.characters = characters;
    });
  }

  get3RandomCharacters(): void {
    const availableCharacters = this.characters.filter(
      (character) =>
        !this.usedCharacterSlugs.includes(character.normalizedName) &&
        !this.removedCharacterSlugs.includes(character.normalizedName)
    );
    const shuffled = availableCharacters.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    this.usedCharacterSlugs.push(...selected.map((c) => c.normalizedName));
    this.selectedCharacters = selected;
    this.isRoundStarted = true;
  }
}
