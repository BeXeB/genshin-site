import { Component, OnInit } from '@angular/core';
import { CharacterService } from '../../../_services/character.service';

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

  characterNames: string[] = []

  ngOnInit(): void {
    this.characterService.getCharacterNames().subscribe(data => {
      this.characterNames = data;
    });
  }
}
