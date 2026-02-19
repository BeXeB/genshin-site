import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../../_services/character.service';
import { CharacterProfile } from '../../../_models/character';

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

  characterData: CharacterProfile[] = []

  ngOnInit(): void {
    this.characterService.getCharacters().subscribe(data => {
      this.characterData = data;
    });
  }
}
