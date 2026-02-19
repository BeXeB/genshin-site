import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { CharacterProfile } from '../../_models/character';
import { Router } from '@angular/router';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css',
})
export class CharactersComponent implements OnInit {
  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  characterData: CharacterProfile[] = [];

  ngOnInit(): void {
    this.characterService
      .getCharacters()
      .subscribe((data) => (this.characterData = data));
  }

  openDetails(name: string) {
    this.router.navigate(['/characters', name.replace(/\s+/g, '').toLowerCase()]);
  }
}
