import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../_services/character.service';
import { Character } from '../../_models/domain/character';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit {
  constructor (
    private characterService: CharacterService
  ) { }

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe({
      next: (characters: Character[]) => {
        console.log('Characters:', characters);
      }
    });
  }
}
